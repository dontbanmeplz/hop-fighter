const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const functions = require('./functions.js');
const maps = require('./maps.js');
const guns = require("./guns.js");
const uniqid = require("uniqid");
const uniqID = ()=>{
	return uniqid().toString();
};
//=======================================================
app.use('/client', express.static(__dirname + '/client'));
app.get('/', (req, res)=>{
	res.sendFile(__dirname+'/client/index.html');
});
app.get('/design', (req, res)=>{
	res.sendFile(__dirname+'/client/design/design.html');
});
app.get('*', (req, res)=>{
	res.sendFile(__dirname+'/client/index.html');
});
http.listen(process.env.PORT, ()=>{
	console.log('Server Initialised');
});
//Other counters
let totalPlayersSinceStart = 0;
let playersOnline = 0;
//Room Constructor
const rooms = [];
const Room = function(name, map, password){
	this.id = uniqID();
	let room = this;
	if(password){
		this.isPass = true;
		this.password = password;
	}else{
		this.isPass = false;
		this.password = "none";
	}
	this.players = [];
	this.platforms = [];
	this.spawnpoints = [];
	this.bullets = [];
	this.clients = [];
	this.healthpacks = [];
	this.crates = [];
	this.maxCapacity = 6;
	this.name = name;
	this.lowestX = 100000;
	this.highestX = 0;
	for(let i = 0; i<maps[map].length; i++){
		if(maps[map][i].tile !== 'spawn'){
			this.platforms.push(maps[map][i]);
		}else{
			maps[map][i].y-=13;
			this.spawnpoints.push(maps[map][i]);
		}
		if(maps[map][i].x<this.lowestX)this.lowestX = maps[map][i].x;
		if(maps[map][i].x>this.highestX)this.highestX = maps[map][i].x;
	}
	this.possibleGuns = [];
	for(let g in guns){
		let gun = guns[g];
		if(gun.name !== "pistol"){
			this.possibleGuns.push(gun);
		}
	}
	this.getAllBullets = ()=>{
		let bulPack = [];
		this.bullets.forEach((bullet)=>{
			bullet.update();
			bulPack.push({
				x:bullet.x,
				y:bullet.y,
				id:bullet.id
			});
		});
		return bulPack;
	};
	this.getAllPlayers = ()=>{
		let pack = [];
		for(let i = 0; i<this.players.length; i++){
			let player = this.players[i];
			pack.push([
				player.x,
				player.y,
				player.id,
				player.flip,
				player.health,
				player.username,
				player.gunAnim,
				player.gun
			]);
		}
		return pack;
	};
	this.getAllCrates = ()=>{
		let pack = [];
		this.crates.forEach((crate)=>{
			pack.push({
				x:crate.x,
				y:crate.y,
				id:crate.id,
				gun:crate.gun.crateName
			})
		});
		return pack;
	};
	this.checkIfAny = ()=>{
		if(this.clients.length === 0 && this.players.length === 0){
			return true;
		}else{
			return false;
		}
	};
	this.Healthpack = function(x, y){
		this.health = 50;
		this.x = x;
		this.y = y;
		this.width = 30;
		this.height = 30;
		this.id = uniqID();
		room.healthpacks.push(this);
	}
	this.Crate = function(x, gun){
		this.x = x;
		this.y = -200;
		this.velocityY = 1;
		this.id = uniqID();
		this.width = 36;
		this.height = 36;
		this.landed = false;
		this.gun = gun;
		room.crates.push(this);
		this.update = ()=>{
			let crateBottom = this.y+this.height/2;
			let crateLeft = this.x - this.width/2;
			let crateRight = this.x + this.width/2;
			room.platforms.forEach((platform)=>{
				let platTop = platform.y - platform.height / 2;
				let platLeft = platform.x - platform.width / 2;
				let platRight = platform.x + platform.width / 2;
				if(crateBottom>=platTop && crateLeft<platRight && crateRight>platLeft){
					this.velocityY = 0;
					io.to(room.name).emit("landed", this.id);
					this.landed = true;
				}
			});
			this.y+=this.velocityY;
		}
	};
	this.Bullet = function(player){
		this.id = uniqID();
		this.height = 4;
		this.width = 4;
		this.damage = player.gun.damage;
		this.destroy = ()=>{
			this.fbi = 'destroyed';
			if(!this.dead){
				let index = room.bullets.indexOf(this);
				room.bullets.splice(index, 1);
				clearTimeout(this.timeout);
				this.dead = true;
				io.to(room.name).emit('bulletOut', this.id);
			}
		};
		this.timeout = setTimeout(()=>{
			this.destroy();
		}, 5000);
		this.y = player.y+player.gun.barrelY;
		if(player.flip){
			this.velocityX = -(player.gun.bulletSpeed);
			this.x = player.x - player.width/2-player.gun.barrelX;
		}else{
			this.velocityX = player.gun.bulletSpeed;
			this.x = player.x + player.width/2+player.gun.barrelX;
		}
		this.playerId = player.id;
		this.update = ()=>{
			this.x += this.velocityX;
			let bulLeft = this.x - this.width / 2;
			let bulRight = this.x + this.width / 2;
			let bulTop = this.y - this.height / 2;
			let bulBottom = this.y + this.height / 2;
			room.platforms.forEach((platform)=>{
				let platLeft = platform.x - platform.width / 2;
				let platRight = platform.x + platform.width / 2;
				let platTop = platform.y - platform.height / 2;
				let platBottom = platform.y + platform.height / 2;
				if(bulRight > platLeft &&
					bulLeft < platRight &&
					bulBottom > platTop &&
					bulTop < platBottom) {
						this.destroy();
				}
			});
		};
	};
	this.Player = function(socket){
		this.id = socket.id;
		this.possibleSpawn = room.spawnpoints;
		let choice = functions.randomIn(this.possibleSpawn);
		this.x = choice.x;
		this.y = choice.y;
		this.height = 60;
		this.width = 30;
		this.username = socket.username;
		this.pressingRight = false;
		this.pressingLeft = false;
		this.pressingUp = false;
		this.pressingDown = false;
		this.pressingSpace = false;
		this.flip = false;
		this.animation = 'stand';
		this.gunAnim = false;
		this.gun = guns["pistol"];
		this.shooting = false;
		this.tint = false;
		this.health = 100;
		this.velocityX = 0;
		this.velocityY = 0;
		this.gravity = 0.1;
		this.gravitySpeed = 0;
		this.collidedUp = false;
		this.collidedDown = false;
		this.collidedLeft = false;
		this.collidedRight = false;
		this.right = this.x + this.width / 2;
		this.left = this.x - this.width / 2;
		this.bottom = this.y + this.height / 2;
		this.top = this.y - this.height / 2;
		this.collidedX = 0;
		this.collidedY = 0;
		this.invulnerable = true;
		this.createdHealth = false;
		this.clip = this.gun.clipSize;
		this.reloading = false;
		setTimeout(() => {
			this.invulnerable = false;
		}, 2000);
		//End of Initialising Variables
		this.update = ()=>{
			//Keybinds
			if(this.pressingRight){
				this.velocityX = 5;
				if(this.flip){
					this.flip = false;
					io.to(room.name).emit('flip', {flip:this.flip, id:this.id});
				}
				if(this.animation !== 'walk' && this.collidedDown){
					this.animation = 'walk';
					io.to(room.name).emit('anims', {anim:this.animation, id:this.id});
				}
			}else if(this.pressingLeft){
				this.velocityX = -5;
				if(!this.flip){
					this.flip = true;
					io.to(room.name).emit('flip', {flip:this.flip, id:this.id});
				}
				if(this.animation !== 'walk' && this.collidedDown){
					this.animation = 'walk';
					io.to(room.name).emit('anims', {anim:this.animation, id:this.id});
				}
			}else{
				this.velocityX = 0;
				if(this.animation !== 'stand'){
					this.animation = 'stand';
					io.to(room.name).emit('anims', {anim:this.animation, id:this.id});
				}
			}
			if(this.animation !== 'stand' && !this.collidedDown){
				this.animation = 'stand';
				io.to(room.name).emit('anims', {anim:this.animation, id:this.id});
			}
			if(this.pressingUp && this.collidedDown){
				this.velocityY = -15;
			}
			if(this.pressingUp && this.velocityY < 0){
				this.velocityY -= 0.55;
			}
			if(this.pressingSpace && !this.shooting){
				if(this.clip !== 0){
					this.shooting = true;
					this.clip--;
					let index = functions.findById(room.clients, this.id);
					room.clients[index].emit("clip", this.clip);
					let bullet = new room.Bullet({
						x:this.x,
						y:this.y, 
						id:this.id, 
						width:this.width, 
						height:this.height, 
						flip:this.flip, 
						gun:this.gun
					});
					this.gunAnim = this.gun.shoot;
					io.to(room.name).emit('gunAnim', {
						anim:this.gunAnim,
						id:this.id,
						hand1X:this.gun.hand1X-this.gun.recoil,
						hand2X:this.gun.hand2X-this.gun.recoil
					});
					room.bullets.push(bullet);
					io.to(room.name).emit('bullet', {x:bullet.x, y:bullet.y, id:bullet.id});
					setTimeout(()=>this.shooting = false, 1000/this.gun.fireRate);
					setTimeout(()=>{
						this.gunAnim = this.gun.non_shoot;
						io.to(room.name).emit('gunAnim', {anim:this.gunAnim, id:this.id, hand1X:this.gun.hand1X, hand2X:this.gun.hand2X});
					}, 100);
					if(this.clip === 0){
						if(!this.reloading){
							this.reloading = true;
							setTimeout(()=>{
								this.clip = this.gun.clipSize;
								room.clients[functions.findById(room.clients, this.id)].emit("clip", this.clip);
								this.reloading = false;
							}, this.gun.reloadTime);
						}
					}
				}else{
					if(!this.reloading){
						this.reloading = true;
						setTimeout(()=>{
							this.clip = this.gun.clipSize;
							room.clients[functions.findById(room.clients, this.id)].emit("clip", this.clip);
							this.reloading = false;
						}, this.gun.reloadTime);
					}
				}
			}
			//Rounding before collisions
			this.velocityX = Math.round(this.velocityX);
			this.velocityY = Math.round(this.velocityY);
			//Collisions
			this.right = this.x + this.width / 2;
			this.left = this.x - this.width / 2;
			this.bottom = this.y + this.height / 2;
			this.top = this.y - this.height / 2;
			this.collidedDown = false;
			this.collidedUp = false;
			this.collidedLeft = false;
			this.collidedRight = false;
			room.platforms.forEach((platform)=>{
				let platRight = platform.x + platform.width / 2;
				let platLeft = platform.x - platform.width / 2;
				let platBottom = platform.y + platform.height / 2;
				let platTop = platform.y - platform.height / 2;
				if(!platform.cant.top && this.bottom<=platTop && this.velocityY>0){
					let distance = platTop - this.bottom;
					let time = Math.round((distance/this.velocityY)*100)/100;
					if(time<1 && time>=0){
						let newVelocityX = Math.round(this.velocityX*time);
						let newX = this.x+newVelocityX;
						let newRight = newX+this.width/2;
						let newLeft = newX - this.width/2;
						if(newRight>platLeft && newLeft<platRight){
							this.collidedY = platTop-this.height/2;
							this.collidedDown = true;
						}else{
						}
					}
				}else if(!platform.cant.bottom && platBottom<=this.top && this.velocityY<0){
					let distance = this.top-platBottom;
					let time = Math.round((distance/(this.velocityY*-1))*100)/100;
					if(time<1 && time>=0){
						let newVelocityX = Math.round(this.velocityX*time);
						let newX = this.x+newVelocityX;
						let newRight = newX+this.width/2;
						let newLeft = newX - this.width/2;
						if(newRight>platLeft && newLeft<platRight){
							this.collidedY = platBottom + this.height/2;
							this.collidedUp = true;
						}
					}
				}
				if(!platform.cant.left && this.right<=platLeft && this.velocityX>0){
					let distance = platLeft - this.right;
					let time = Math.round((distance/this.velocityX)*100)/100;
					if(time<1 && time>=0){
						let newVelocityY = Math.round(this.velocityY*time);
						let newY = this.y+newVelocityY;
						let newBottom = newY+this.height/2;
						let newTop = newY - this.height/2;
						if(newTop<platBottom && newBottom>platTop){
							this.collidedX = platLeft-this.width/2;
							this.collidedRight = true;
						}
					}
				}else if(!platform.cant.right && platRight<=this.left && this.velocityX<0){
					let distance = this.left - platRight;
					let time = Math.round((distance/(this.velocityX*-1))*100)/100;
					if(time<1 && time>=0){
						let newVelocityY = Math.round(this.velocityY*time);
						let newY = this.y+newVelocityY;
						let newBottom = newY+this.height/2;
						let newTop = newY-this.height/2;
						if(newTop<platBottom && newBottom>platTop){
							this.collidedX = platRight+this.width/2;
							this.collidedLeft = true;
						}
					}
				}
			});
			if(this.collidedDown||this.collidedUp){
				this.y = this.collidedY;
				this.velocityY = 0;
				if(this.collidedDown){
					this.gravitySpeed = 0.5;
				}
			}else{
				this.y+=this.velocityY;	
			}
			if(this.collidedLeft||this.collidedRight){
				this.x = this.collidedX;
				this.velocityX = 0;
			}else{
				this.x+=this.velocityX;
			}
			this.gravitySpeed += this.gravity;
			if(this.gravitySpeed>8)this.gravitySpeed = 8;
			this.velocityY+=this.gravitySpeed;
			if(this.velocityY>35)this.velocityY = 35;
			this.right = this.x + this.width / 2;
			this.left = this.x - this.width / 2;
			this.bottom = this.y + this.height / 2;
			this.top = this.y - this.height / 2;
			//Collisions ^^
			if(!this.createdHealth){
				room.healthpacks.forEach((heal)=>{
					let healLeft = heal.x - heal.width / 2;
					let healRight = heal.x + heal.width / 2;
					let healTop = heal.y - heal.height / 2;
					let healBottom = heal.y + heal.height / 2;
					if(this.right>healLeft &&
						this.left<healRight &&
					  this.bottom>healTop &&
						this.top<healBottom){
							this.health+=heal.health;
							if(this.health>100)this.health = 100;
							io.to(room.name).emit('health', {health:this.health, id:this.id});
							let index = room.healthpacks.indexOf(heal);
							room.healthpacks.splice(index, 1);
							io.to(room.name).emit('healthout', heal.id);
					}
				});
			}
			if(!this.invulnerable){
				room.bullets.forEach((bullet)=>{
					let bulLeft = bullet.x + bullet.width / 2;
					let bulRight = bullet.x - bullet.width / 2;
					let bulTop = bullet.y - bullet.height / 2;
					let bulBottom = bullet.y + bullet.height / 2;
					if(bulRight<=this.left && bullet.velocityX>0){
						let distance = this.left - bulRight;
						let time = distance/bullet.velocityX;
						if(time<1 && time>=0&&this.top<bulBottom&&this.bottom>bulTop){
							this.health-=bullet.damage;
							this.tint = true;
							io.to(room.name).emit('tint', {tint:this.tint, id:this.id});
							setTimeout(() => {
								this.tint = false;
								io.to(room.name).emit('tint', { id: this.id, tint: this.tint });
							}, 200);
							bullet.destroy();
							io.to(room.name).emit('health', {health:this.health, id:this.id});
							if(this.health<=0){
								io.to(room.name).emit('dead', this.id);
								let index = functions.findById(room.players, this.id);
								room.players.splice(index, 1);
								socket.in = false;
								index = functions.findById(room.clients, bullet.playerId);
								room.clients[index].kills++;
								room.clients[index].emit('kills', room.clients[index].kills);
								index = functions.findById(room.clients, this.id);
								room.clients[index].deaths++;
								room.clients[index].emit('deaths', room.clients[index].deaths);
								let healthpack = new room.Healthpack(this.x, this.y);
								room.healthpacks.push(healthpack);
								this.createdHealth = true;
								io.to(room.name).emit('healthpack', {x:healthpack.x, y:healthpack.y, id:healthpack.id});
							}
						}
					}else if(this.right<=bulLeft && bullet.velocityX<0){
						let distance = bulLeft - this.right;
						let time = distance/(bullet.velocityX*-1);
						if(time<1 && time>=0&&this.top<bulBottom&&this.bottom>bulTop){
							this.health-=bullet.damage;
							this.tint = true;
							io.to(room.name).emit('tint', {tint:this.tint, id:this.id});
							setTimeout(() => {
								this.tint = false;
								io.to(room.name).emit('tint', { id: this.id, tint: this.tint });
							}, 200);
							bullet.destroy();
							io.to(room.name).emit('health', {health:this.health, id:this.id});
							if(this.health<=0){
								io.to(room.name).emit('dead', this.id);
								let index = functions.findById(room.players, this.id);
								room.players.splice(index, 1);
								socket.in = false;
								index = functions.findById(room.clients, bullet.playerId);
								room.clients[index].kills++;
								room.clients[index].emit('kills', room.clients[index].kills);
								index = functions.findById(room.clients, this.id);
								room.clients[index].deaths++;
								room.clients[index].emit('deaths', room.clients[index].deaths);
								let healthpack = new room.Healthpack(this.x, this.y);
								room.healthpacks.push(healthpack);
								this.createdHealth = true;
								io.to(room.name).emit('healthpack', {x:healthpack.x, y:healthpack.y, id:healthpack.id});
							}
						}
					}
				});
			}
			if(this.y>5000){
				io.to(room.name).emit('dead', this.id);
				let index = functions.findById(room.players, this.id);
				room.players.splice(index, 1);
				socket.in = false;
				index = functions.findById(room.clients, this.id);
				room.clients[index].deaths++;
				room.clients[index].emit('deaths', room.clients[index].deaths);
			}
		}
		this.pickUp = ()=>{
			room.crates.forEach((crate)=>{
				if(crate.landed){
					let crateBottom = crate.y+crate.height/2;
					let crateTop = crate.y-crate.height/2;
					let crateLeft = crate.x-crate.width/2;
					let crateRight = crate.x+crate.width/2;
					if(this.right>crateLeft&&this.left<crateRight&&this.bottom>crateTop&&this.top<crateBottom){
						let index = room.crates.indexOf(crate);
						room.crates.splice(index, 1);
						io.to(room.name).emit("removeCrate", crate.id);
						io.to(room.name).emit("changegun", {gun:crate.gun, id:this.id});
						this.gun = crate.gun;
						this.clip = this.gun.clipSize;
					}
				}
			});
		};
	}
	this.genCrate = ()=>{
		let gun = functions.randomIn(this.possibleGuns);
		let crate = new this.Crate(functions.randomBetween(this.lowestX, this.highestX), gun);
		io.to(this.name).emit("crate", {x:crate.x, y:crate.y, id:crate.id, gun:gun.crateName});
	};
	this.crateInterval = setInterval(this.genCrate, 30000);
}
io.on('connection', (socket)=>{
	totalPlayersSinceStart++;
	socket.in = false;
	socket.inAnyRoom = false;
	socket.kills = 0;
	socket.deaths = 0;
	let player;
	let room;
	socket.on('reqRooms', (data, res)=>{
		let response = [];
		rooms.forEach((room)=>{
			response.push({
				id:room.id,
				name:room.name,
				players:room.players.length,
				password:room.isPass
			});
		});
		res(response);
	});
	socket.on('createRoom', (data, res)=>{
		let anyRoomAlready = false;
		rooms.forEach((room)=>{
			if(room.name = data.name)anyRoomAlready = true;
		});
		if(rooms.length>11||anyRoomAlready){
			res('failed');
			return;
		}else{
			res('succeeded');
			let newroom = new Room(data.name, data.map, data.password);
			rooms.push(newroom);
			io.emit('newroom', {id:newroom.id, name:newroom.name, players:newroom.players.length, isPass:newroom.type});
		}
	});
	socket.on('joinroom', (data, res)=>{
		let roomIndex = functions.findById(rooms, data.room);
		if(rooms[roomIndex].players.length>=rooms[roomIndex].maxCapacity){
			res('failed');
			return;
		}else{
			res('joined');
		}
		socket.removeAllListeners('reqId');
		playersOnline++;
		room = rooms[roomIndex];
		socket.join(room.name);
		room.clients.push(socket);
		socket.inAnyRoom = true;
		console.log('User ' + socket.id + ' connected');
		console.log('Players Online: ' + playersOnline);
		console.log('Total players online since server start: ' + totalPlayersSinceStart);
		socket.kills = 0;
		socket.deaths = 0;
		socket.on('reqId', (data, res)=>{
			socket.removeAllListeners('newplayer');
			socket.removeAllListeners('keysDown');
			socket.removeAllListeners('leaveroom');
			socket.removeAllListeners('pressF');
			socket.username = data;
			player = new room.Player(socket);
			room.players.push(player);
			socket.in = true;
			io.emit('roomplayers', {id:room.id, players:room.players.length});

			res({
				id: socket.id,
				allOthers: room.getAllPlayers(),
				bullets: room.getAllBullets(),
				platforms:room.platforms,
				crates:room.getAllCrates(),
				maxClip:player.gun.clipSize,
				clip:player.clip
			});

			socket.to(room.name).broadcast.emit('newplayer', {
				x:player.x,
				y:player.y,
				id:player.id,
				health:player.health,
				username:player.username,
				flip:player.flip,
				gun:player.gun
			});
			socket.on('keysDown', (data)=>{
				if (data.up) player.pressingUp = true;
				else player.pressingUp = false;
				if (data.left) player.pressingLeft = true;
				else player.pressingLeft = false;
				if (data.right) player.pressingRight = true;
				else player.pressingRight = false;
				if (data.space) player.pressingSpace = true;
				else player.pressingSpace = false;
			});
			socket.on("pressF", (data)=>{
				player.pickUp();
			});
			socket.on('leaveroom', ()=>{
				playersOnline--;
				console.log('User ' + socket.id + ' left');
				console.log('Players Online: ' + playersOnline);
				socket.leave(room.name);
				let index;
				if(socket.in){
					index = functions.findById(room.players, player.id);
					room.players.splice(index, 1);
					io.to(room.name).emit('remove', player.id);
				}
				index = room.clients.indexOf(socket);
				room.clients.splice(index, 1);
				socket.inAnyRoom = false;
				io.emit('roomplayers', {id:room.id, players:room.players.length});
				if(room.checkIfAny()){
					io.emit('deletedRoom', room.id);
					clearInterval(room.crateInterval);
					index = rooms.indexOf(room);
					rooms.splice(index, 1);
				}
			});
		});
	});
	socket.on('ready', ()=>{
		socket.ready = true;
	});
	socket.on('disconnect', ()=>{
		console.log('User '+socket.id+' left');
		let index;
		if(socket.in){
			index = functions.findById(room.players, player.id);
			room.players.splice(index, 1);
			io.to(room.name).emit('remove', socket.id);
		}
		if(socket.inAnyRoom){
			index = room.clients.indexOf(socket);
			room.clients.splice(index, 1);
			io.emit("roomplayers", {id:room.id, players:room.players.length});
			if(room.checkIfAny()){
				io.emit('deletedRoom', room.id);
				clearInterval(room.crateInterval);
				index = functions.findById(rooms, room.id);
				rooms.splice(index, 1);
			}
		}
	});
});
setInterval(()=>{
	rooms.forEach((room)=>{
		let pack = [];
		let bulPack = [];
		let cratePack = [];
		room.bullets.forEach((bullet)=>{
			bullet.update();
			if(!bullet.dead){
				bulPack.push({
					x:bullet.x,
					y:bullet.y,
					id:bullet.id
				});
			}
		});
		room.players.forEach((player)=>{
			player.update();
			pack.push([
				player.x,
				player.y,
				player.id,
			]);
		});
		room.crates.forEach((crate)=>{
			crate.update();
			cratePack.push([
				crate.x,
				crate.y,
				crate.id
			]);
		});
		room.clients.forEach((socket)=>{
			if(socket.ready){
				socket.emit("pos", {pack:pack, bulPack:bulPack, cratePack:cratePack});
			}
		});
	});
}, 1000/30);
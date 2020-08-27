function findById(array, id){
	let index = array.map(function(item){return item.id;}).indexOf(id);
	return index;
}
class maingame extends Phaser.Scene{
    constructor(){
        super({key:"maingame"});
    }
    preload (){
    }
    create (){
			game.startTitle = ()=>{
				this.scene.start("titlescreen");
			};
			scene = "maingame";
			document.getElementById("leaveroom").style.display = "none";
			document.getElementById("roomContainer").style.display = "none";
			document.getElementById("openCreateRoom").style.display = "none";
			document.getElementById("createRoomContainer").style.display = "none";
			document.getElementById("clipContainer").style.display = "block";
			document.getElementById("stats").style.display = "block";
			let clip = document.getElementById("clip");
			let killShow = document.getElementById("kills");
			let deathShow = document.getElementById("deaths");
			this.ui = false;
			//Connection Preload VVVVVVVVV
			this.playerList = [];
			this.bulletList = [];
			this.healthpackList = [];
			this.crateList = [];
			//Platforms
			this.platforms = this.physics.add.staticGroup();
			//Adds a platform
			game.addPlatform = (x, y, tile) =>{
					this.platforms.create(x, y, "sprites", tile);
			};
			//==============================================
			//==============================================
			//Player functions:
			//Add a player into the game
			game.addPlayer = (x,y,id, health, username, flip, gun) =>{
				this.playerList[id] = this.physics.add.sprite(x, y, "sprites", "sprite_2");
				this.playerList[id].anims.play("stand", true);
				this.playerList[id].health = health;
				this.playerList[id].username = this.add.bitmapText(this.playerList[id].x,this.playerList[id].y-75, "bitmap", username, 15);
				this.playerList[id].flipX = flip;
				this.playerList[id].gun = this.physics.add.sprite(x+gun.x, y+gun.y, gun.name);
				this.playerList[id].gun.bonusX = gun.x;
				this.playerList[id].gun.bonusY = gun.y;
				this.playerList[id].hand1 = this.physics.add.sprite(x+gun.hand1X, y+gun.hand1Y, "sprites", "hand");
				this.playerList[id].hand2 = this.physics.add.sprite(x+gun.hand2X, y+gun.hand2Y, "sprites", "hand");
				this.playerList[id].hand1X = gun.hand1X;
				this.playerList[id].hand2X = gun.hand2X;
				this.playerList[id].hand1Y = gun.hand1Y;
				this.playerList[id].hand2Y = gun.hand2Y;
				this.playerList[id].hand1.setDepth(100);
				this.playerList[id].hand2.setDepth(100);
				this.playerList[id].gun.anims.play(gun.non_shoot);
				console.log(gun.non_shoot);
				this.playerList[id].gun.flipX = flip;
				if(!flip){
					this.playerList[id].gun.x = x+gun.x;
				}else{
					this.playerList[id].gun.x = x-gun.x;
				}
				Phaser.Display.Align.In.TopCenter(this.playerList[id].username, this.add.zone(this.playerList[id].x , this.playerList[id].y, 30, 85));
			};
			//Set the camera to follow the player
			game.startFollow = (ID, clipSize, clip) =>{
				this.cameras.main.startFollow(this.playerList[ID]);
				this.playerList[ID].health = 100;
				this.healthBar = document.getElementById("health");
				killShow.innerHTML = "Kills: "+client.kills;
				deathShow.innerHTML = "Deaths: "+client.deaths;
				this.healthBar.style.display = "block";
				this.healthBar.value = this.playerList[ID].health;
				this.ui = true;
				this.playerList[ID].clipSize = clipSize;
			};
			//Removes a player
			game.remove = (id) =>{
				this.playerList[id].username.destroy();
				this.playerList[id].destroy();
				this.playerList[id].gun.destroy();
				this.playerList[id].hand1.destroy();
				this.playerList[id].hand2.destroy();
			};
			//Updates a player with new positions
			game.update = (x, y, id) =>{
				this.playerList[id].x = x;
				this.playerList[id].y = y;
				Phaser.Display.Align.In.TopCenter(this.playerList[id].username, this.add.zone(this.playerList[id].x , this.playerList[id].y, 30, 100));
				if(this.playerList[id].flipX===false){
					this.playerList[id].gun.x = x+this.playerList[id].gun.bonusX;
					this.playerList[id].hand1.x = x+this.playerList[id].hand1X;
					this.playerList[id].hand2.x = x+this.playerList[id].hand2X;
				}else{
					this.playerList[id].gun.x = x-this.playerList[id].gun.bonusX;
					this.playerList[id].hand1.x = x-this.playerList[id].hand1X;
					this.playerList[id].hand2.x = x-this.playerList[id].hand2X;
				}
				this.playerList[id].gun.y = y+this.playerList[id].gun.bonusY;
				this.playerList[id].hand1.y = y+this.playerList[id].hand1Y;
				this.playerList[id].hand2.y = y+this.playerList[id].hand2Y;
			};
			//Updates the player's animations
			game.updateAnims = (id, anim)=>{
				this.playerList[id].anims.play(anim, true);
			};
			//Updates the player's gun's animations
			game.updateGunAnims = (anim, id, hand1X, hand2X)=>{
				this.playerList[id].gun.anims.play(anim);
				this.playerList[id].hand1X = hand1X;
				this.playerList[id].hand2X = hand2X;
			};
			//Updates the side to which the player is flipped
			game.updateFlip = (id, flip)=>{
				this.playerList[id].flipX = flip;
				this.playerList[id].gun.flipX = flip;
			};
			//Updates the health of the player
			game.updateHealth = (id, health)=>{
				this.playerList[id].health = health;
			};
			//Updates the text in the corner
			game.updateText = ()=>{
				if(this.ui){
					this.healthBar.value = this.playerList[ID].health;
					killShow.innerHTML = "Kills: "+client.kills;
					deathShow.innerHTML = "Deaths: "+client.deaths;
				}
			};
			//Updates the tint of the player - If he is shot he will tint red
			game.updateTint = (id, tint)=>{
				if(tint){
					this.playerList[id].setTint(0xff0000);
				}else{
					this.playerList[id].setTint(undefined);
				}
			};
			//Changes gun of player
			game.changeGun = (gun, id)=>{
				this.playerList[id].gun.destroy();
				this.playerList[id].gun = this.physics.add.sprite(this.playerList[id].x, this.playerList[id].y, gun.name);
				this.playerList[id].gun.setDepth(10);
				this.playerList[id].gun.bonusX = gun.x;
				this.playerList[id].gun.bonusY = gun.y;
				this.playerList[id].gun.flipX = this.playerList[id].flipX;
				this.playerList[id].gun.anims.play(gun.non_shoot);
				this.playerList[id].hand1X = gun.hand1X;
				this.playerList[id].hand2X = gun.hand2X;
				this.playerList[id].hand1Y = gun.hand1Y;
				this.playerList[id].hand2Y = gun.hand2Y;
				if(id === ID){
					this.playerList[id].clipSize = gun.clipSize;
					clip.innerHTML = gun.clipSize+"/"+this.playerList[ID].clipSize;
				}
			};
			//Updates the bullets left in the player's clip
			game.updateClip = (clipLeft)=>{
				clip.innerHTML = clipLeft+"/"+this.playerList[ID].clipSize;
			};
			//==============================================
			//==============================================
			//Bullet functions:
			//Adds a bullet to the game
			game.addBullet = (x, y, id) =>{
				let bullet = this.physics.add.image(x, y, "sprites", "bullet");
				bullet.id = id;
				this.bulletList.push(bullet);
			};
			//Removes a bullet from the game
			game.destroyBullet = (id)=>{
				let index = findById(this.bulletList, id);
				try{
					this.bulletList[index].destroy();
					this.bulletList.splice(index, 1);
				}catch{
					console.log(index, id, this.bulletList);
				}	
			};
			//Updates a bullet's position
			game.bulUpdate = (bullet) =>{
				let index = findById(this.bulletList, bullet.id);
				try{
					this.bulletList[index].x = bullet.x;
					this.bulletList[index].y = bullet.y;
				}catch{
					console.log(index, bullet.id, this.bulletList);
				}
			};
			//==============================================
			//==============================================
			//Healthpack functions:
			//Adds a healthpack into the game
			game.addHealthpack = (x, y, id)=>{
				this.healthpackList[id] = this.physics.add.image(x, y, "sprites", "health");
			}
			//Removes a healthpack from the game
			game.removeHealthpack = (id)=>{
				this.healthpackList[id].destroy();
			};
			//==============================================
			//==============================================
			//Crate functions:
			//Adds a crate and its parachute into the game
			game.addCrate = (x, y, id, gun)=>{
				this.crateList[id] = this.physics.add.image(x, y, "sprites", gun);
				this.crateList[id].setDepth(-100);
				this.crateList[id].parachute = this.add.image(x, y-(18+45/2), "sprites", "parachute");
				this.crateList[id].parachute.setDepth(-100);
			};
			//Removes a crate's parachute when the crate has landed
			game.removeParachute = (id)=>{
				this.crateList[id].parachute.destroy();
			};
			//Updates a crate's position
			game.crateUpdate = (x, y, id)=>{
				this.crateList[id].x = x;
				this.crateList[id].y = y;
				if(this.crateList[id].parachute){
					this.crateList[id].parachute.y = y-(18+45/2);
					this.crateList[id].parachute.x = x;
				}
			};
			//Removes a crate from the game
			game.removeCrate = (id)=>{
				this.crateList[id].destroy();
			};
			//==============================================
			//==============================================
			//Starts the death scene
			game.deathScene = ()=>{
				this.key_W.isDown = false;
				this.key_A.isDown = false;
				this.key_D.isDown = false;
				this.key_SPACE.isDown = false;
				this.scene.start("death");
			};
			//Connection Preload^^^^^^^^
			//Adds a cyan blue "sky" background to the game
			this.cameras.main.setBackgroundColor('#04bddf');
			//Loads all the animations for the player
			this.anims.create({
					key: 'walk',
					frames: [{key:"sprites", frame:"sprite_0"}, {key:"sprites", frame:"sprite_1"}],
					frameRate: 12,
					repeat: -1
			});
			this.anims.create({
					key: 'stand',
					frames: [{key:"sprites", frame:"sprite_2"}],
					frameRate: 2,
			});
			//Loads all the animations for the guns
			this.anims.create({
				key:"shoot-pistol",
				frames: [{key:"sprites", frame:"pistol_1"}],
				frameRate:5
			});
			this.anims.create({
				key:"non-shoot-pistol",
				frames: [{key:"sprites", frame:"pistol_0"}],
				frameRate:5
			});
			this.anims.create({
				key:"shoot-ar",
				frames:[{key:"sprites", frame:"ar_1"}],
				frameRate:5
			});
			this.anims.create({
				key:"non-shoot-ar",
				frames:[{key:"sprites", frame:"ar_0"}],
				frameRate:5
			});
			this.anims.create({
				key:'non-shoot-spr',
				frames:[{key:"sprites", frame:"spr_0"}],
				frameRate:5
			});
			this.anims.create({
				key:'shoot-spr',
				frames:[{key:"sprites", frame:"spr_1"}],
				frameRate:5
			});
			this.anims.create({
				key:'non-shoot-mp',
				frames:[{key:"sprites", frame:"mp_0"}],
				frameRate:5
			});
			this.anims.create({
				key:'shoot-mp',
				frames:[{key:"sprites", frame:"mp_1"}],
				frameRate:5
			});
			this.anims.create({
				key:'non-shoot-mini',
				frames:[{key:"sprites", frame:"mini_0"}],
				frameRate:5
			});
			this.anims.create({
				key:'shoot-mini',
				frames:[{key:"sprites", frame:"mini_1"}],
				frameRate:5
			});
			//Binds keys to game
			this.key_W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
			this.key_A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
			this.key_D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
			this.key_SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
			this.input.keyboard.on('keydown_F', (event)=>{
				client.pressF();
			});
			//Sends a signal to the server that it is ready
			client.reqId(client.username);
			client.sendReady();
    }
    update (time, delta){
			let keys = {
					up:false,
					left:false,
					right:false,
					space:false
			};
			if(this.key_A.isDown){
					keys.left = true;
			}else if(this.key_D.isDown){
					keys.right = true;
			}
			if(this.key_W.isDown){
					keys.up = true;
			}
			if(this.key_SPACE.isDown){
					keys.space = true;
			}
			client.sendKeys(keys);
    }
}
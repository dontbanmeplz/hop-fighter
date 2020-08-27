function valid(f) {
	!(/^[A-z&#209;&#241;0-9]*$/i).test(f.value)?f.value = f.value.replace(/[^A-z&#209;&#241;0-9]/ig,''):null;
}
function isValid(str){
	let ex = /[A-z&#209;&#241;0-9]/;
	return ex.test(str);
}

var scene = "none";
var canvasWidth = document.documentElement.clientWidth;
var canvasHeight = document.documentElement.clientHeight;
var config = {
    type: Phaser.AUTO,
    width: canvasWidth,
    height: canvasHeight,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene:[titlescreen, maingame, death, roomscreen],
};

var game = new Phaser.Game(config);
var socket = io();
var client = {};
var ID;
var join = {};
client.username = "";
client.kills = 0;
client.deaths = 0;
var log = 0;
socket.on("redirect", (data)=>{
	window.location.replace(data);
});
socket.on("newroom", (data)=>{
	if(scene === "roomscreen"){
		game.addRoom(data);
	}
});
socket.on("roomplayers", (data)=>{
	if(scene==="roomscreen"){
		game.updateRoomPlayers(data);
	}
});
socket.on("deletedRoom", (data)=>{
	if(scene==="roomscreen"){
		game.removeRoom(data);
	}
});
client.removeListeners = ()=>{
	socket.removeAllListeners("pos");
	socket.removeAllListeners("bullet");
	socket.removeAllListeners("bulletOut");
	socket.removeAllListeners("remove");
	socket.removeAllListeners("dead");
	socket.removeAllListeners("newplayer");
	socket.removeAllListeners("anims");
	socket.removeAllListeners("flip");
	socket.removeAllListeners("health");
	socket.removeAllListeners("tint");
	socket.removeAllListeners("kick");
	socket.removeAllListeners("healthpack");
	socket.removeAllListeners("healthout");
	socket.removeAllListeners("crate");
	socket.removeAllListeners("landed");
	socket.removeAllListeners("removeCrate");
	socket.removeAllListeners("changegun");
};
client.reqId = function(username){
	console.log("response");
	client.removeListeners();
	socket.emit("reqId",username, function(data){
		ID = data.id;
		for(var i = 0; i<data.allOthers.length;i++){
			game.addPlayer(data.allOthers[i][0], data.allOthers[i][1], data.allOthers[i][2], data.allOthers[i][4], data.allOthers[i][5], data.allOthers[i][3], data.allOthers[i][7]);
		}
		for (var o = 0; o<data.bullets.length; o++){
				game.addBullet(data.bullets[o].x, data.bullets[o].y, data.bullets[o].id);
		}
		for(var n = 0; n<data.platforms.length; n++){
				game.addPlatform(data.platforms[n].x, data.platforms[n].y, data.platforms[n].tile);
		}
		data.crates.forEach((crate)=>{
			game.addCrate(crate.x, crate.y, crate.id, crate.gun);
		});
		game.startFollow(ID, data.maxClip, data.clip);
		socket.on("pos", function(data){
				for(var i = 0; i<data.pack.length;i++){
						game.update(data.pack[i][0], data.pack[i][1], data.pack[i][2]);
				}
				for(var n = 0; n<data.bulPack.length; n++){
						game.bulUpdate(data.bulPack[n]);
				}
				data.cratePack.forEach((crate)=>{
					game.crateUpdate(crate[0], crate[1], crate[2]);
				});
		});
		socket.on("bullet", function(data){
				game.addBullet(data.x, data.y, data.id); 
		});
		socket.on("bulletOut", function(data){
				game.destroyBullet(data);
		});
		socket.on("remove", function(data){
				game.remove(data);
		});
		socket.on("dead", function(data){
			if(data === ID){
					game.deathScene();
					client.removeListeners();
			}else{
					game.remove(data);
			}
		});
		socket.on("newplayer", function(data){
			if(data.id !== ID){
					game.addPlayer(data.x, data.y, data.id, data.health, data.username, data.flip, data.gun);
			}
		});
		socket.on("kills", (data)=>{
			client.kills = data;
			game.updateText();
		});
		socket.on("deaths", (data)=>{
			client.deaths = data;
			game.updateText();
		});
		socket.on("anims", (data)=>{
			game.updateAnims(data.id, data.anim);
		});
		socket.on("gunAnim", (data)=>{
			game.updateGunAnims(data.anim, data.id, data.hand1X, data.hand2X);
		});
		socket.on("flip", (data)=>{
			game.updateFlip(data.id, data.flip);
		});
		socket.on("health", (data)=>{
			game.updateHealth(data.id, data.health);
			game.updateText();
		});
		socket.on("tint", (data)=>{
			game.updateTint(data.id, data.tint);
		});
		socket.on("kick",()=>{
			game.startTitle();
		});
		socket.on("healthpack", (data)=>{
			game.addHealthpack(data.x, data.y, data.id);
		});
		socket.on("healthout", (data)=>{
			game.removeHealthpack(data);
		});
		socket.on("crate", (data)=>{
			game.addCrate(data.x, data.y, data.id, data.gun);
		});
		socket.on("landed", (data)=>{
			game.removeParachute(data);
		});
		socket.on("removeCrate", (data)=>{
			game.removeCrate(data);
		});
		socket.on("changegun", (data)=>{
			game.changeGun(data.gun, data.id);
		});
		socket.on("clip", (data)=>{
			game.updateClip(data);
		});
	});
};
client.sendKeys = function(keys){
    socket.emit("keysDown", keys);
};
client.pressF = ()=>{
	socket.emit("pressF", "f");
};
client.sendReady = function(){
    socket.emit("ready");
};
client.joinroom = (id)=>{
	let row = document.getElementById(id);
	let password = "none";
	if(row.password){
		let cell = row.cells[2];
		let password = cell.childNodes[1].value;
	}
	socket.emit("joinroom", {room:id, password:password}, (callback)=>{
		if(callback==="joined"){
			client.kills = 0;
			client.deaths = 0;
			game.startMain();
		}
	});
};
client.reqRooms = ()=>{
	socket.emit("reqRooms", "a", (data)=>{
		game.renderRooms(data);
	});
};
client.leaveRoom = ()=>{
	if(scene==="death"){
		socket.emit("leaveroom");
		game.startTitle();
	}else if(scene==="roomscreen"){
		game.startTitle();
	}else if(scene==="createRoom"){
		game.closeCreateRoom();
	}
};
client.createRoom = ()=>{
	let name = document.getElementById("createRoomName");
	let map = document.getElementById("createRoomDropdown").value;
	let password = document.getElementById("createRoomPassword");
	if(name.value !== "" && isValid(name.value)){
		
		socket.emit("createRoom", {name:name.value, map:map, password:password.value},(data)=>{
			alert(data);
		});
		client.reqRooms();
		name.value = "";
		password.value = "";
		game.closeCreateRoom();
	}else{
		alert("You must set a valid room name");
	}
};
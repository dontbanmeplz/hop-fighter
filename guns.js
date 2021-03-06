const guns = {
	pistol:{
		name:"pistol",
		shoot:"shoot-pistol",
		non_shoot:"non-shoot-pistol",
		y:0,
		x:27,
		fireRate:2,
		hand1X:15,
		hand1Y:0,
		hand2X:15,
		hand2Y:2,
		recoil:3,
		damage:20,
		barrelX:20,
		barrelY:-4,
		clipSize: 7,
		reloadTime: 1500,
		bulletSpeed: 20
	},
	ar:{
		name:"ar",
		shoot:"shoot-ar",
		non_shoot:"non-shoot-ar",
		y:4,
		x:20,
		fireRate:5,
		hand1X:-7,
		hand1Y:8,
		hand2X:20,
		hand2Y:5,
		recoil:3,
		damage:15,
		barrelX:25,
		barrelY:-2,
		crateName:"ar-crate",
		clipSize: 30,
		reloadTime: 2500,
		bulletSpeed: 25
	},
	sniper:{
		name:"sniper",
		shoot:"shoot-spr",
		non_shoot:"non-shoot-spr",
		y:-11,
		x:34,
		fireRate:0.8,
		hand1X:3,
		hand1Y:-12,
		hand2X:28,
		hand2Y:-12,
		recoil:3,
		damage:50,
		barrelX:45,
		barrelY:-17,
		crateName:"sniper-crate",
		clipSize: 5,
		reloadTime: 2500,
		bulletSpeed: 40
	},
	mp5:{
		name:"mp5",
		shoot:"shoot-mp",
		non_shoot:"non-shoot-mp",
		y:-2,
		x:23,
		fireRate:8,
		hand1X:-7,
		hand1Y:4,
		hand2X:20,
		hand2Y:1,
		recoil:2,
		damage:8,
		barrelX:22,
		barrelY:0,
		crateName:"mp5-crate",
		clipSize: 30,
		reloadTime: 2500,
		bulletSpeed: 25
	},
	minigun:{
		name:"minigun",
		shoot:"shoot-mini",
		non_shoot:"non-shoot-mini",
		y:10,
		x:23,
		fireRate:10,
		hand1X:-10,
		hand1Y:2,
		hand2X:5,
		hand2Y:2,
		recoil:2,
		damage:5,
		barrelX:22,
		barrelY:13,
		crateName:"minigun-crate",
		clipSize: 150,
		reloadTime: 5000,
		bulletSpeed: 18
	}
};
module.exports = guns;
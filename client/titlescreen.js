var theme;
var noU = document.getElementById("noU");
var musicSet = false;
class titlescreen extends Phaser.Scene{
    constructor(){
        super({key:"titlescreen"});
    }

    preload(){
		this.load.image("logo", "client/img/logo.png");
		this.load.audio("theme", "client/sound/hop-fighter.mp3");
		this.load.atlas("sprites", "client/img/spritesheet.png", "client/img/sprites.json");
		this.load.bitmapFont("bitmap", "/client/img/font.png", "client/img/font.xml");
    }
    create(){
		this.cameras.main.setBackgroundColor('#04bddf');
		this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		game.startTitle = ()=>{
			this.scene.start("titlescreen");
		};
		scene = "titlescreen";
		document.getElementById("leaveroom").style.display = "none";
		document.getElementById("usernameContainer").style.display = "block";
		document.getElementById("loading").style.display = "none";
		document.getElementById("roomContainer").style.display = "none";
		document.getElementById("openCreateRoom").style.display = "none";
		document.getElementById("createRoomContainer").style.display = "none";
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
		socket.removeAllListeners("healthpack");
		var titlescreen = true;
		let input = document.getElementById("playername");
		input.style.display = "block";
		let text1 = this.add.image(0,0, "logo");
		let text2 = this.add.text(0,0, "Press ENTER to start", {
				fontFamily:"Righteous, Arial Black",
				fontSize:48,
				color:"#fc662b",
				fontWeight:"bold"
		});
		Phaser.Display.Align.In.Center(text1, this.add.zone(canvasWidth/2, canvasHeight/3, canvasWidth, canvasHeight));
		Phaser.Display.Align.In.Center(text2, this.add.zone(canvasWidth/2, canvasHeight/1.5, canvasWidth, canvasHeight));
		this.input.keyboard.on('keydown_ENTER', function (event) {
			if(titlescreen){
				if(input.value !== ""&&input.value!==null&&input.value!==undefined&&input.value!==NaN && isValid(input.value)){
					client.username = input.value;
					input.style.display = "none";
					titlescreen = false;
					this.scene.start("roomscreen");
				}else{
					alert("Please enter a valid username");
				}
			}
			
        }, this);
		var loopMarker = {
			name: 'loop',
			start: 0,
			duration: 78,
			config: {
				loop: true
			}
		};
		if(!musicSet){
			theme = this.sound.add("theme");
			theme.addMarker(loopMarker);
			theme.play('loop', {
				delay:0
			});
			musicSet = true;
		}
    }
    update(){
        
    }
}
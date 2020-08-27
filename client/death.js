var leavebutton = document.getElementById("leaveroom");
class death extends Phaser.Scene{
    constructor(){
        super({key:"death"});
    }

    preload(){
        
    }
    create(){
		scene = "death";
		game.startTitle = ()=>{
			this.scene.start("titlescreen");
		};
		leavebutton.style.display = "block";
		document.getElementById("health").style.display = "none";
		document.getElementById("stats").style.display = "none";
		document.getElementById("clipContainer").style.display = "none";
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
		this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		this.cameras.main.setBackgroundColor('#04bddf');
        var text1 = this.add.text(0,0, "You Died!", {
            fontFamily:"Righteous, Arial Black",
            fontSize:64,
            color:"#ff3a3a"
        });
        this.scoretext = this.add.text(0,0, "Kills: "+client.kills+"\nDeaths: "+client.deaths, {
            fontFamily:"Righteous, Arial Black",
            fontSize:48,
            color:"#fc662b"
    	});
        var text2 = this.add.text(0,0, "Press ENTER to restart", {
            fontFamily:"Righteous, Arial Black",
            fontSize:48,
            color:"#fc662b"
        });
        Phaser.Display.Align.In.Center(this.scoretext, this.add.zone(canvasWidth/2, canvasHeight/2, canvasWidth, canvasHeight));
        Phaser.Display.Align.In.Center(text1, this.add.zone(canvasWidth/2, canvasHeight/3, canvasWidth, canvasHeight));
        Phaser.Display.Align.In.Center(text2, this.add.zone(canvasWidth/2, canvasHeight/1.5, canvasWidth, canvasHeight));
        this.input.keyboard.once('keydown_ENTER', function (event) {
			if(scene === "death")
            	this.scene.start("maingame");
				console.log(theme);
        }, this);
    }
    update(){
        this.scoretext.setText("Kills: "+client.kills+"\nDeaths: "+client.deaths);
    }
}

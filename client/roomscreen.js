class roomscreen extends Phaser.Scene{
	constructor(){
		super({key:"roomscreen"});
	}
	preload(){

	}
	create(){
		this.input.keyboard.removeAllListeners();
		game.startTitle = ()=>{
			this.scene.start("titlescreen");
		};
		game.leave = ()=>{
			game.startTitle();
		};
		game.startMain = ()=>{
			this.scene.start("maingame");
		};
		scene = "roomscreen";
		this.cameras.main.setBackgroundColor('#04bddf');
		document.getElementById("roomContainer").style.display = "block";
		document.getElementById("leaveroom").style.display = "block";
		document.getElementById("usernameContainer").style.display = "none";
		document.getElementById("openCreateRoom").style.display = "block";
		document.getElementById("stats").style.display = "none";
		let table = document.getElementById("roomList");
		game.addRoom = (room)=>{
			console.log(room);
			let row = table.insertRow(-1);
			row.id = room.id;
			row.class="table-row";
			row.password = room.password;
			if(room.password){
				row.innerHTML =`<td class="hover-underline" onclick="client.joinroom('${row.id}')">${room.name}</td>
												<td>${room.players}/6</td>
												<td>
													<div class="ui input">
														<input id="${"input"+room.id}" type="text" placeholder="Password">
													</div>
												</td>`;
			}else{
				row.innerHTML =`<td class="hover-underline" onclick="client.joinroom('${row.id}')">${room.name}</td>
												<td>${room.players}/6</td>`;
			}
		};
		game.renderRooms = (rooms)=>{
			table.innerHTML = "";
			rooms.forEach((room)=>{
				game.addRoom(room);
			});
		};
		game.updateRoomPlayers = (id, players)=>{
			let row = document.getElementById(id);
			let cell = row.cells[1];
			cell.innerHTML = players+"/6";
		};
		game.removeRoom = (id)=>{
			let row = document.getElementById(id);
			table.deleteRow(row.rowIndex-2);
		};
		game.closeCreateRoom = ()=>{
			document.getElementById("createRoomContainer").style.display = "none";
			document.getElementById("openCreateRoom").style.display = "block";
			document.getElementById("roomContainer").style.display = "block";
			game.leave = game.startTitle;
		};
		game.openCreateRoom = ()=>{
			document.getElementById("createRoomContainer").style.display = "block";
			document.getElementById("openCreateRoom").style.display = "none";
			document.getElementById("roomContainer").style.display = "none";
			game.leave = game.closeCreateRoom;
		};
		client.reqRooms();
	}
	update(){

	}
}
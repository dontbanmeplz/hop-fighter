var zone = document.getElementById("container");
var sidebar = document.getElementById("sidebar");
var selected = undefined;
var arr = [];
var snapX = 0;
var snapY = 0;
let mouseDown = false;
var print = document.getElementById("print");
var table = document.getElementById("table");
for(var i = 0;i<100;i++){
	let row = table.insertRow();
	row.style.height = 36+"px";
	for(let n = 0;n<150;n++){
		let cell = row.insertCell();
		cell.class = "cell";
		cell.addEventListener("mousemove", ()=>hover(cell));
		cell.addEventListener("mousedown", ()=>hover(cell));
	}
}
let down = ()=>mouseDown = true;
let up = ()=>mouseDown = false;
var cells = document.getElementsByClassName("cell");
function select(what){
	var img = document.getElementById(what);
	if(img.style.border === "2px solid yellow"){
		img.style.border = "2px solid white";
		img.selected = false;
		selected = undefined;
	}else{
		img.style.border = "2px solid yellow";
		img.selected = true;
		var images = document.getElementsByClassName("img");
		selected = img;
		for(var i = 0;i<images.length;i++){
			let image = images[i];
			if(img !== image){
				image.style.border = "2px solid white";
				image.selected = false;
			}
		}
	}
}
function add(what){
	if(what){
		var image = document.getElementById(what);
		console.log("yarte");
	}else{
		if(selected){
			var image = selected;
			console.log("yeet");
		}else{
			console.log("yote");
			return;
		}
	}
	var add = document.createElement("img");
	add.src = image.src;
	add.draggable = false;
	add.class = "inZone";
	add.style.position = "absolute";
	add.style.left = snapX+"px";
	add.style.top = snapY+"px";
	add.id = Math.random();
	add.oncontextmenu = ()=>{
		remove(add);
		return false;
	}
	zone.appendChild(add);
	arr.push({x:Math.round(snapX), y:Math.round(snapY), width:36, height:36, tile:image.id, id:add.id});
	window.getSelection().removeAllRanges();
}
function load(){
	var input = document.getElementById("input");
	if(input.value){
		print.innerHTML = "";
		arr = [];
		var locArr = JSON.parse(input.value);
		for(var i=0;i<locArr.length;i++){
			snapX = locArr[i].x;
			snapY = locArr[i].y;
			add(locArr[i].tile);
		}
	}
}
function remove(what){
	what.style.display = "none";
	var index = arr.map(function(item){return item.id;}).indexOf(what.id);
	arr.splice(index, 1);
}
function hover(x){
	var rect = x.getBoundingClientRect();
	snapX = rect.left;
	snapY = rect.top;
	if(mouseDown&&!x.created){
		add();
		x.created = true;
	}
}
function compile(){
	for(let i in arr){
		arr[i].cant = {
			bottom:false,
			top:false,
			left:false,
			right:false
		}
		for(let n in arr){
			if(arr[n].tile !== "spawn"){
				if(arr[n].x===arr[i].x){
					if(arr[n].y-arr[i].height===arr[i].y){
						arr[i].cant.bottom = true;
					}else if(arr[n].y +arr[i].height === arr[i].y){
						arr[i].cant.top = true;
					}
				}else if(arr[n].y===arr[i].y){
					if( arr[n].x-arr[i].width === arr[i].x){
						arr[i].cant.right = true;
					}else if(arr[n].x +arr[i].width === arr[i].x)
						arr[i].cant.left = true;
				}
			}
		}
	}
	print.value = JSON.stringify(arr);
}
function copy(){
	print.select();
	document.execCommand("copy");
	alert("Map File Copied");
}
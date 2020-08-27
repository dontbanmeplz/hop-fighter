var functions = {
	findById: function(array, id){
		var index = array.map(function(item){return item.id;}).indexOf(id);
		return index;
	},
	randomString: function(length){
		var text = "";
  		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (var i = 0; i < length; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	},
	randomIn: function(arr){
		let index = Math.floor(Math.random()*arr.length);
		return arr[index];
	},
	randomBetween: function(min, max){
		return Math.floor(Math.random()*(max-min+1)+min);
	}
}
module.exports =  functions;
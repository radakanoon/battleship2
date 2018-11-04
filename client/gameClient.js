//old name = /vue/game.js
var socket = io('');

socket.on('enemyIsFound', function(){
	vm.statusMessage = 'Enemy has been spotted on the radar. Quick place your ships!';
	socket.emit('init');
});

socket.on('init', function(obj){
	vm.player = obj;
});

socket.on('permissionFire', function(obj){ //show whose turn is
	if(vm.player.id == obj.id){
		setTheTimer(); //set timer for 10 sec
		moveTimer(); //set graphic for timer
		vm.player.permissionToFire = true; //can play
		vm.statusMessage = 'Your turn';
	}else{
		vm.permissionToFire = false; //cannot play
		vm.statusMessage = 'Enemy turn';
	}
});

socket.on('PlayerJoined', function(){
	vm.statusMessage = 'Not ready'; //enemy haven't done anything yet
});

socket.on('enemyIsReady', function(){
	vm.enemyReady = true;
	vm.statusMessage = 'Ready';
	console.log('Enemy is ready');
});

socket.on('hit', function(obj){ //hit the ship
	if(obj.hit) document.querySelector('[data-enemyCoordination="'+ obj.coordination +'"]').style.backgroundColor = "#f7786b";
});

socket.on('updateBoards', function(obj){ //update grid
	var tile = document.querySelector('[data-coordination="' + obj.coordination +'"]');
	if(tile.getAttribute('class') == 'placed-tile'){
		tile.style.backgroundColor = '#f7786b';
		vm.statusMessage = 'enemy turn';
	}else{
		tile.style.backgroundColor = '#b1cbbb';
		vm.statusMessage = 'your turn';
	}
});

socket.on('win', function(obj){
	if(vm.player.id != obj.id) return alert('you win');
	alert('you lose')
});

Vue.component('board', {
	props:['columns', 'rows'],
	template: '#board-template',

	methods: { //place ship at first
		placeTheShip: function(el){

			console.log(this.$root.chosenShip);

			if(this.$root.chosenShip == null || this.$root.chosenShip.available == 0) return; //not chosing ship/ship not available --> do nothing
			var setCoordination = el.currentTarget.getAttribute('data-coordination');
			var size = this.$root.chosenShip.size;
			var hoveredTile = document.querySelectorAll('.tile-hover');
			var overlap = false; //check for placing collision 

			for (var i = size - 1; i >= 0; i--) {
				if(this.$root.rotated){ //horizontal
					if(parseInt(setCoordination.split("").reverse().join("")[0]) + size <= this.columns){ //make ship not go out of grid
						var e = document.querySelector('[data-coordination="'+(parseInt(setCoordination) + (i))+'"]');
						if (e.className == 'placed-tile') overlap = true;
					}else{
						var e = document.querySelector('[data-coordination="' + (parseInt(setCoordination) - (i))+'"]'); 
						if (e.className == 'placed-tile') overlap = true;
					}

				}
				if(!this.$root.rotated){ //vertical
					if(document.querySelector('[data-coordination="' + (parseInt(setCoordination) + (i * 10)) + '"]') != null){
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]');
						if(e.className == 'placed-tile') overlap = true;
					}else{
						console.log('no');
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((size - i) *10)) + '"]');
						if(e.className == 'placed-tile') overlap = true;
					}
				}
			}

			if(!overlap){
				console.log(this.$root.chosenShip);
				for (var i = hoveredTile.length - 1; i >= 0; i--) {
					hoveredTile[i].className = 'placed-tile';
					this.$root.chosenShip.location.push(parseInt(hoveredTile[i].getAttribute('data-coordination')));
				}
				this.$root.chosenShip.available--;
				console.log(socket.emit('place', this.$root.chosenShip));
			}
		},
	
		changeStyle: function(el) { //when choosing
			if(this.$root.chosenShip == null || this.$root.chosenShip.available == 0) return;
			
			var setCoordination = el.currentTarget.getAttribute('data-coordination');
			var size = this.$root.chosenShip.size;
				
			for (var i = 0; i < size; i++) {
				var e = document.querySelector('[data-coordination="'+ setCoordination + (i)+'"]');

				if(this.$root.rotated) {
					if (parseInt(setCoordination.split("").reverse().join("")[0]) + size <= this.columns) {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i)) +'"]');
						e.className = e.className == 'placed-tile' ? 'placed-tile' : 'tile-hover';
					}else{
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - (i)) +'"]');
						e.className = e.className == 'placed-tile' ? 'placed-tile' : 'tile-hover';
					}
				} else if (!this.$root.rotated) {
					if (document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]') != null) {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]');
						e.className = e.className == 'placed-tile' ? 'placed-tile' : 'tile-hover';
					}else{
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((size - i) * 10)) +'"]');
						e.className = e.className == 'placed-tile' ? 'placed-tile' : 'tile-hover';
					}
				}
			}
		},

		setDef: function(el) {
			if(this.$root.chosenShip == null) return;
			var setCoordination = el.currentTarget.getAttribute('data-coordination');

			var size = this.$root.chosenShip.size;

			for (var i = 0; i < size; i++)
				if(this.$root.rotated) {
					if (parseInt(setCoordination.split("").reverse().join("")[0]) + size <= this.columns) {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 1)) +'"]');
						e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
					}
					else {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((i) * 1)) +'"]');
						e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
					}
				} else if (!this.$root.rotated) {
					if (document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]') != null) {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]');
						e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
					}
					else {
						var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((size - i) * 10)) +'"]');
						e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
					}
				}
		}
	}

});

Vue.component('enemy-board', {
	template: "#enemyBoard-template", 
	props: ['columns', 'rows'], 

	methods: {
		fire: function(el){
			if(el.currentTarget.getAttribute('data-hittable') == 'true')
			{
				if(!vm.player || vm.player.permissionToFire == false) return; //not your turn
				if(vm.enemyReady != true) return alert('Your enemy is not ready yet');
				console.log(parseInt(el.currentTarget.getAttribute('data-enemyCoordination')));
				socket.emit('fire', {'player':vm.player, 'coordination' : parseInt(el.currentTarget.getAttribute('data-enemyCoordination'))});
				el.currentTarget.className = 'missed-tile';
				el.currentTarget.setAttribute('data-hittable', 'false');
				vm.player.permissionToFire = false;
				vm.statusMessage = 'Enemy turn';
			}
		}
	}
});

var vm = new Vue({
	el: '#battleship',

	data: {
		ships: [
		{'type': 'Aircaft', 'size': 4, 'sink': false, 'available': 1, 'location' : []},
		{'type': 'Battleship', 'size': 4, 'sink': false, 'available': 1, 'location' : []},
		{'type': 'Destroyer', 'size': 4, 'sink': false, 'available': 1, 'location' : []},
		{'type': 'Submarine', 'size': 4, 'sink': false, 'available': 1, 'location' : []},
		],

		chosenShip: null,
		statusMessage: 'Waiting for enemy....',
		rotated: false,
		enemyReady: false,
		ready: false
	}, 

	methods: {
		setChosenShip: function(ship){
			this.chosenShip = ship;
			console.log(this.chosenShip = ship);
		}
	}, 

	computed: {
		isReady: function(){ //tell that they ready to play (after done putting ship in grid)

			var ready = true;
			for (var i = 0; i < this.ships.length; i++) {
				if(this.ships[i].available > 0) ready = false; //if ship still available means need to place more
			}
			if(ready == true) socket.emit('ready');
			return ready;
		}
	}
}); 
//Vue.config.debug = true;

var timee = 0
var seconds = 10
var id = 0
var elem = document.getElementById("myBar");

function setTheTimer(){ //set interval function
	document.getElementById("the-timer").innerHTML = "0:10"; //set intial interval
	
    function incrementSeconds() { 
		seconds -= 1; //decrease time by 1 sec
		if(seconds<0 || vm.player.permissionToFire == false){ //if timeout or being pressed --> clear timeout, set info back to original
			document.getElementById("the-timer").innerHTML = "0:10";
			clearInterval(timee)
			seconds = 10;
		}else{ //if still have time
			document.getElementById("the-timer").innerHTML = "0:0"+seconds;
		}
	}
	timee = setInterval(incrementSeconds, 1000);
}

function moveTimer() {
    elem.style.width = '100%'; //make a style full of green area
    var elwidth = 100;
    
    id = setInterval(frame, 1000);
    function frame() {
		if (elwidth === 0 || vm.player.permissionToFire == false) { //if timeout or being pressed --> clear interval
			clearInterval(id);
			elem.style.width = '100%'; //make a style full of green area getInterval
		} else {
			elwidth = elwidth-10; //decrease every 10 sec
			elem.style.width = elwidth + '%'; 
		}
    }
}
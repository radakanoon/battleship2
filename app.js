//var DEBUG = true;
//import Express
var app = require('express')();
var express = require('express');
var path = require('path');
//create a NodeJs http server
var http = require('http').Server(app);

var io = require('socket.io')(http);
app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/socket.io'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/client/gameRoom.html'));
});

var players = [], turns = 0;

var ships = [
		{'type': 'Aircaft', 'size': 4, 'sink': false, 'available': 1, 'location' : []},
		{'type': 'Battleship', 'size': 4, 'sink': false, 'available': 1, 'location' : []},
		{'type': 'Destroyer', 'size': 4, 'sink': false, 'available': 1, 'location' : []},
		{'type': 'Submarine', 'size': 4, 'sink': false, 'available': 1, 'location' : []},
	]; //takes 16 hits before all ships are sink

var updateShip = function(id, ship, callback){

	var player;

    console.log('Ship', ship);

	for (var i = 0; i< players.length; i++) {
		if(players[i].id == id) player = players[i];
	}


	for (var i = 0; i< ships.length; i++) {
		if (ships[i].type == ship.type) {
				player.ships.push(ship);
		}
	}

    console.log('player', player.id, 'ship', ship, 'ships', player.ships);
};

/**
 * Giving a player his turn to play.
 * socket.id  {[int]}   id   [network socketid]
 * @return {[boolean]}       [sets pemission to true]
 */
var permissionToFire = function(id, callback){
	players.map(function(enemy){if(enemy.id == id) callback(enemy.permissionToFire = true);
	});
}

io.on('connection', function(socket){
	var id = socket.id;

	//only 2 players allowed to play
	if (players.length >= 2){ 
		socket.emit('RoomIsFull', true);
		console.log('Room is full');
		return;
	}

	socket.on('place', function(ship){
		updateShip(socket.id, ship, function(){
		});
	});

	/**
	 * check if enemy is ready & send
	 * @return {[boolean]}
	 */
	socket.on('ready', function(){
		socket.broadcast.emit('enemyIsReady')
	});

	//create player & push to players array with starting data.
	players.push({'id' : socket.id, 'ready': true, 'takenHits': 0, permissionToFire: false, 'ships': []});

	socket.on('init', function(player){
		var player;
			for (var i = players.length - 1; i >= 0; i--) {
			if(players[i].id == id) player = players[i]
		}

		//init with if statement to force the correct id.
		if (id == socket.id) socket.emit('init', player);
		console.log(id + 'is ready to play');
	});

	//message that 2 players are able to play
	if(players.length > 1){
		socket.emit('enemyIsFound', 'enemyIsFound');
		socket.broadcast.emit('enemyIsFound', 'enemyIsFound');

		players[0].permissionToFire = true; //give the first player permission to fire.

		/** random first player*/
		// var i = Math.ceil((Math.random()*(players.length)));
		// players[i].permissionToFire = true;


	};

	socket.on('fire', function(obj, id, ship){
		turns++;

		var enemy = [];
		// //define enemy
		players.map(function(player){if(player.id != socket.id) return enemy = player});
		console.log('enemy', enemy.id);

		/**
		 * check if fired shot matches any ship location.
		 * @boolean {[true]}
		 */
		var hit = enemy.ships
				.map(ship => ship.location)
				.some(coordinates => coordinates.some(coordinate => coordinate === obj.coordination ));

		if(hit){
			enemy.takenHits++;
			console.log('Hit! '+ obj.coordination);
			socket.emit('hit', {'coordination' : obj.coordination, 'hit' : hit});

			/**
			 * if all ships are hit, send win/lose message
			 */
			if(enemy.takenHits >= 16) io.sockets.emit('win', enemy);

		}else{ //miss
			console.log('missed');
			console.log(obj.coordination);
		};

		/**
		 * updating the board of the current enemy
		 * to show where the other play hit/missed.
		 */
		socket.broadcast.emit('updateBoards', { 'coordination': obj.coordination, 'enemy':enemy});

		/**
		 * give the turn to fire to the enemy who got shot.
		 * @return {[object]}  [send enemy object]
		 */
		permissionToFire(enemy.id, function(){
			io.sockets.connected[enemy.id].emit('permissionFire', enemy);
		});
		console.log(enemy);
	});

	socket.on('disconnect', function(){
			players.map(function(player, index){if(player.id == id) players.splice(index, 1)});
			console.log(id +" player left "+ players.length);
	});




	socket.on('chat', function(msg){
		if(users[socket.id].connected != null && msg){
			console.log((new Date().toISOString()) + ' Chat message from ' + socket.id + ': ' + msg);
		// Send message to opponent
		socket.broadcast.to('game' + users[socket.id].inGame.id).emit('chat', {
        	name: 'Opponent',
        	message: entities.encode(msg),
      	});

      	// Send message to self
      	io.to(socket.id).emit('chat', {
        	name: 'Me',
        	message: entities.encode(msg),
      		});
		}
	});


});

//let it listen on port
http.listen(4000, function(){
	console.log('listening on port 4000');
});

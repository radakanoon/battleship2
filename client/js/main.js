const Const = {};
var gameWorld = {};


Const.availableShips = [ //type(name) of ship + amount of ship
    {
        'type': 'carrier', //type = name
        'size': 4, //size of ship : 4 slot
        'max': 1 //number of this type ship
    },
    {
        'type': 'battleship',
        'size': 4,
        'max': 1
    },
    {
        'type': 'destroyer',
        'size': 4,
        'max': 1
    },
    {
        'type': 'submarine',
        'size': 4,
        'max': 1
    },
];
Const.player1 = 0; //player1 in game
Const.player2 = 1; //player2 in game (even though ขึ้นเกมใหม่ it's also same number 0 and 1)


Const.empty = 0; //water
Const.ship = 1; //boat	
Const.miss = 2; //shot missed
Const.hit = 3;  //boat got hit
Const.sink = 4; //sunk ship

gameWorld.grid = {}; //grid
gameWorld.ships = []; //ship
gameWorld.shipTitels = []; //show position of ship after press??
gameWorld.previewTites = []; //preview when choose position to place ship
gameWorld.seletedShipType = Const.availableShips[3]; //select ship type
gameWorld.selectedShipRotation = 1; //select direction of ship when placing (horizontal, vertical)
/**
 * Game statistics to show
 * How many hits
 * How many times player got hit
 * How many games got played
 * how many games got won
 * getting unique id or create one
 */
function Statistics() {
    this.taken = 0; //total number of press
    this.hits = 0; //when hit get ++

    this.totalTaken = parseInt(localStorage.getItem('totalTaken'), 1) || 0; // not sure??
    this.totalHits = parseInt(localStorage.getItem(totalHits), 1) || 0; //total number of hit
    this.gamesPlayed = parseInt(localStorage.getItem('gamesPlayed'), 1) || 0; //number of game
    this.gamesWon = parseInt(localStorage.getItem('gamesWon'), 1) || 0; //number of game won --> for what??
    this.uuid = localStorage.getItem('uuid') || this.createuuid(); //uuid whatt??
}

Statistics.prototype.incrementHits = function () { //when hit get one point
    this.hits++;
};

Statistics.prototype.incrementTaken = function () { //when press, will increase
    this.taken++;
};

Statistics.prototype.wonGame = function () { //when win game, number of game ++ and number of won game ++
    this.gamesPlayed++;
    this.gamesWon++;
    resetGame();
};

Statistics.prototype.lostGame = function () { //when lose game, number of game ++ only
    this.gamesPlayed++;
    resetGame();
};

/**
 * Define ship objects
 * constructor
 * @param Ship type
 */
function Ship(type, pos) { //draw ship shape
    this.pos = pos; //position of ship (x,y)
    this.type = type; //type(name) of ship
    this.damage = 0; //number of being shot! boom!! //int

    this.maxDamage = this.type.size; //max number to be shot = size of ship //int
    this.sink = false; //not sink yet = false //boolean
    this.used = false; //not use yet = false ?? not placing yet? //boolean
}

/**
 * Increment damage the ship
 * @return {boolean}
 */
Ship.prototype.incrementDamage = function () { //when get shot, number of being shot ++ and
    this.damage++;
    if (this.isSink()) { //check that sink or not by isSink() --> if yes(sink), make this ship be sunk by call sinkShip() method
        this.sinkShip()
    }
};

/**
 * Check to see if ship is sunk
 * @return {Boolean}
 */
Ship.prototype.isSink = function () { //return boolean --> if number of being shot >= max ship size : true(sink)
    return this.damage >= this.maxDamage;
};

/**
 * make the ship sink
 * @return {Boolean} [returns true]
 */
Ship.prototype.sinkShip = function () { //(make number of damage = max damage) and (sink = true)
    this.damage = this.maxDamage;
    this.sink = true;
};

/**
 * @param title returns title object from grid
 * @param click place the ship
 * @param mousover, gives color before placing
 * @param mousout, gives color red (cancel)
 * @param draw, draws title in the grid
 */
var Title = function (posX, posY, id) { //title = block inside grid --> position x-axis, y-axis and id name
    this.pos = {x: posX, y: posY}; //position in x-axis and y-axis
    this.id = id; //id for whatt???

    this.clicked = false; //not click yet : false

    this.elem = document.createElement("div"); //elem = ช่องที่จะยิง : create HTML div (=block for ช่องที่จะยิง)
    this.elem.className = "title"; //add HTML .title class for the block
    this.elem.id = id; //add HTML id = id
    this.elem.style.width = "28px"; //width of block
    this.elem.style.height = "28px"; //height of block

    this.elem.addEventListener("click", function () { //when being clicked, place this block which position(x,y) by placeShip(...)
        placeShip(this, {'x': posX, 'y': posY});
    });

    this.elem.addEventListener("mouseover", function () { //when being hovered(not click), preview this shadow block which position(x,y) by previewShip(...)
        previewShip(this, {'x': posX, 'y': posY});
    });

    this.elem.addEventListener("mouseout", resetPreviews); //when mouse get out of grid --> reset previews by resetPreviews()

    this.draw = function (parent) { //draw = press , append this element(chosen block) into HTML
        parent.appendChild(this.elem);
    };
};

/**
 * @param grid 
 * @return {object} [grid object]
 * 
 * @param draw [draws the grid in the dom]
 * @return {void}
 * @param removeFromDOM [removes ship from dom]
 */
var Grid = function () {
    this.container = document.createElement("div");  //container = grid area : create HTML div (for grid)
    this.container.id = "grid"; //add HTML id = 'grid'

    this.draw = function () { //create grid
        document.body.appendChild(this.container); //append all grid into HTML

        var id = 0; //for initial id
        for (var y = 0; y < 8; y++) { //for column
            for (var x = 0; x < 8; x++) { //for row
                var title = new Title(x, y, id); //create new title(block) with position x, y and id
                title.draw(this.container); //append the block into grid
                id++; //increase id number
            }
        }
    };

    this.removeFromDOM = function () { //remove the ship from page??
        document.removeChild(this.container); //remove grid from HTML

    }
};

/**
 * @param  placeShip [placing ship on the board]
 * @return { void } 
 * 
 * @param  gameWorld.selectedShipRotation [rotation from ships]
 */
var placeShip = function (title, pos) { 
    if (maxAmountOfType()) { //??
        return;
    }

    var ship = new Ship(gameWorld.seletedShipType, pos); //create new ship ตาม type ที่เลือก

    gameWorld.previewTites = []; //show preview
    var titles = [];

    switch (gameWorld.selectedShipRotation) { //check vertical or horizontal
        case 0: //vertical
            if (shipOutOFWorld(pos)) { //out of grid, nothing happen
                break;
            }


            for (var i = 0; i < gameWorld.seletedShipType.size; i++) { //
                titles.push(Number(title.id) + i*12);
            }

            var taken = titleTaken(titles);

            if (!taken) {
                for (i = 0; i < gameWorld.seletedShipType.size; i++) {
                    titleElem = document.getElementById(titles[i]);
                    titleElem.style.backgroundColor = "blue";

                    gameWorld.shipTitels.push(titles[i]);
                }
                gameWorld.ships.push(ship);
            }
            break;
        case 1: //horizontal
            if (shipOutOFWorld(pos)) {
                break;
            }

            for (i = 0; i < gameWorld.seletedShipType.size; i++) {
                titles.push(Number(title.id) + i);
            }

            taken = titleTaken(titles);

            if (!taken) {
                for (i = 0; i < gameWorld.seletedShipType.size; i++) {
                    titleElem = document.getElementById(titles[i]);
                    titleElem.style.backgroundColor = "blue";

                    gameWorld.shipTitels.push(titles[i]);
                }
                gameWorld.ships.push(ship);
            }
            break;
    }
    enableStartButton();
};

/**
 * @param  previewShip 
 * @return { void} [shows a preview of the ship]
 */
var previewShip = function (title, pos) {
    if (maxAmountOfType()) {
        return;
    }

    var previewTitles = [];

    switch (gameWorld.selectedShipRotation) {
        case 0: //vertical
            if (shipOutOFWorld(pos)) {
                break;
            }

            for (var i = 0; i < gameWorld.seletedShipType.size; i++) {
                previewTitles.push(Number(title.id) + i*12);
            }

            var taken = titleTaken(previewTitles);

            if (!taken) {
                for (i = 0; i < gameWorld.seletedShipType.size; i++) {
                    var id = Number(title.id) + i*12;

                    titleElem = document.getElementById(id);
                    titleElem.style.backgroundColor = "lightblue";

                    gameWorld.previewTites.push(id);
                }
            }
            break;
        case 1: //horizontal
            if (shipOutOFWorld(pos)) {
                break;
            }

            for (i = 0; i < gameWorld.seletedShipType.size; i++) {
                previewTitles.push(Number(title.id) + i);
            }

            taken = titleTaken(previewTitles);

            if (!taken) {
                for (i = 0; i < gameWorld.seletedShipType.size; i++) {
                    id = Number(title.id) + i;

                    titleElem = document.getElementById(id);
                    titleElem.style.backgroundColor = "lightblue";

                    gameWorld.previewTites.push(id);
                }
            }
            break;
    }
};

/**
 * @return {reset Previews}
 * @return { void} [reset the previews of ships]
 */
var resetPreviews = function () {
    for (var i = 0; i < gameWorld.previewTites.length; i++) {
        var elem = document.getElementById(gameWorld.previewTites[i]);
        elem.style.backgroundColor = "red";
    }
    gameWorld.previewTites = [];
};

/**
 * @param {setShipType}
 * @return { void } [set the var to a ship type]
 */
var setShipType = function (type) { //set type of ship
    gameWorld.seletedShipType = Const.availableShips[type]; //number of available this type of ship
};

//sets the ship rotation. called by a button
var setShipRotation = function (rotation) { //rotate ship
    gameWorld.selectedShipRotation = rotation;
    if(rotation == 0) {
        document.getElementById("vertical").style.borderColor = "blue";
        document.getElementById("horizontal").style.borderColor = "lightblue";
    }else{
        document.getElementById("vertical").style.borderColor = "lightblue";
        document.getElementById("horizontal").style.borderColor = "blue";
    }
};

/**
 * @param  {titleTaken}
 * @return {[boolean]} [check if the cordinate of a placing ship is taken]
 */
var titleTaken = function (titles) {
    var taken = false;
    for (i = 0; i < gameWorld.seletedShipType.size; i++) {
        if (gameWorld.shipTitels.indexOf(titles[i]) != -1) {
            taken = true;
        }
    }
    return taken;
};

/**
 * @param  {shipOutOFWorld}
 * @return {bool} [Check if the ship is without the world]
 */
var shipOutOFWorld = function (pos) {
    switch (gameWorld.selectedShipRotation) {
        case 0:
            return pos.y + gameWorld.seletedShipType.size > 8;
            break;
        case 1:
            return pos.x + gameWorld.seletedShipType.size > 8;
            break;
    }
};

/**
 * @return {maxAmountOfType}
 * @return {boolean} [check if maximum amounts of shiptype is used]
 */
var maxAmountOfType = function () { //check that we already place all ship or not for each type of ship
    var amount = 0; //amount = total present amount of ship now
    for (var i = 0; i < gameWorld.ships.length; i++) { //loop till < size of each ship
        if (gameWorld.ships[i].type.type == gameWorld.seletedShipType.type) { 
            amount++; //add amount
        }
    }

    return amount >= gameWorld.seletedShipType.max; //if amount now >= ??
};

//contains the grid that shows the ships of the player. draw() creates the grid on the DOM
/**
 * @param {OwnShipGrad}
 * @return {object} [returns a grid witch contains the ships of the player]
 * @param {draw}
 * @return {void} [draws own ships on the grid]
 */
var OwnShipGrid = function (ships, shipTitles) {
    this.ships = ships;
    this.shipTitles = shipTitles;

    this.elem = document.createElement("div");
    this.elem.id = "ownShips";

    this.draw = function () {
        document.body.appendChild(this.elem);

        var id = 0;
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                var title = document.createElement("div");
                title.className = "title";
                title.style.width = "28px";
                title.style.height = "28px";

                for(var z = 0; z < shipTitles.length; z++){
                    if(id == shipTitles[z]){
                        title.style.backgroundColor = 'blue';
                    }
                }

                this.elem.appendChild(title);

                id++;
            }
        }
    };
};

//this is the grid on wich the player can shoot
/**
 * @param TargetGrid [Is the enemy grid, where a player can aim]
 * @param {draw} [Puts the grid in the DOM}
 */
var TargetGrid = function () {
    this.elem = document.createElement("div");
    this.elem.id = "shootGrid";

    this.draw = function () {
        document.body.appendChild(this.elem);

        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                var title = new TargetGridTitle(this.elem, x, y);
            }
        }
    };
};

/**
 * @param {TargetTitle}
 * @returns { object } [Target Grid]
 */
var TargetGridTitle = function(elem, x, y){
    var title = document.createElement("div");
    title.className = "title shootTitle";
    title.style.width = "28px";
    title.style.height = "28px";

    elem.appendChild(title);
    var pos = {'x': x, 'y': y};
    title.addEventListener("click", function (){ shoot(pos)}); //if (shoot = null) mean already press then cannot click
};

/**
 * @param resetGame [refresh the page (reset)]
 */
var resetGame = function () {
    location.reload();
};

/**
 * @return { void } [initialize the targetplayer his grid]
 */
var startStageTwo = function () {
    document.body.removeChild(document.getElementById("grid"));

    gameWorld.shootedTitles = [];

    var shipTitles = gameWorld.shipTitels;
    var ships = gameWorld.ships;

    gameWorld = {};
    gameWorld.ownShipsGrid = new OwnShipGrid(ships, shipTitles);

    gameWorld.ownShipsGrid.draw();

    gameWorld.targetGrid = new TargetGrid();
    gameWorld.targetGrid.draw();

};

var shoot = function(pos, targetPlayer, targetGrid) //check that already press or not --> already shoot, return null
{
    //var targetGrid = targetGrid;
    var targetPlayer;

    // if (targetPlayer == Const.player1)
    // {
    //     targetGrid = this.player1Grid;
    //     targetShip = this.player1Ship;

    // }else if (targetPlayer == Const.player2){
    //     targetGrid = this.player2Grid;
    //     targetShip = this.player2Ship;
    // }

    if (targetGrid.isSink(pos))
    {
        return null;

    }else if (targetGrid.isMissed(pos)){
        return null;
    }

};

var enableStartButton = function(){
    if(gameWorld.ships.length >= 4){ //if place all ship(4 ships), then can start game
        document.getElementsByClassName("startButton")[0].disabled = false;
    }
};


gameWorld.grid = new Grid();
gameWorld.grid.draw();
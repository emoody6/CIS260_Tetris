
//GLOBAL VARIABLES//

// Tetris Game Setup //

var startTime;	//Time when the program starts
var lastTime;	//Time of previous frame
var curTime;	//Time of current frame

var frame; //Number of the frame we are on right now
var startingPace = 500
var pace = startingPace; //Automatic piece movement time (ms); Speeds up as the game continues
var nextStep = 0; //Keeps track of when the next step should occue

var queueA = [] //List of pieces to use next
var queueB = [] //Replaces A once A is empty, then is replaced by a new list

var rowsToClear = []; //Holds a list of the rows that are completed and need to be cleared
var clearingRow = 0; //Variable that controls row clearing. See the section on row clearing for more detailed analysis
var score = 0

var gameState = 1

var lastMLoutput
var MLtrigger = 0
var AI_active = false

const GAME_OVER = 0
const GAME_PLAY = 1
const GAME_SETUP = 2

//Positional constants
const LEFT = -1;
const RIGHT = 1;

const X = 0
const Y = 1

const BOARD_HEIGHT = 20; //Height of the game board (Y)
const BOARD_WIDTH = 10; //Width of the game board (X)

const EMPTY = 0; //Empty board tiles are marked with 0, filled tiles are marked with their respective color

//TODO: Combine all of these into one object?

const COLOR = { //Each piece's assigned color index
	Z: 1,
	L: 2,
	O: 3,
	S: 4,
	I: 5,
	J: 6,
	T: 7,
}

//Color Indexes
const RED = 1;
const ORANGE = 2;
const YELLOW = 3;
const GREEN = 4;
const CYAN = 5;
const BLUE = 6;
const PURPLE = 7;

//Index to color codes
const COLOR_CODE = {
	1: 	'#e03030',
	2: 	'#e08030',
	3: 	'#e0e030',
	4:	'#30e030',
	5:	'#30e0e0',
	6:	'#3030e0',
	7: 	'#e030e0',
}

const SPAWN_OFFSET = [3, -1]

//Spawn positions of the pieces
const PIECES = {
	
	L:{
		Rotation: [
			[[0, 1], [1, 1], [2, 0], [2, 1]], //Rotation Index 0, spawn position
			[[1, 0], [1, 1], [1, 2], [2, 2]], //Rotation Index 1
			[[0, 1], [1, 1], [2, 1], [0, 2]], //Rotation Index 2
			[[0, 0], [1, 0], [1, 1], [1, 2]], //Rotation Index 3
		],
		Center: [1, 1],
		OffsetGroup: 0,
	},
	
	J:{
		Rotation: [
			[[0, 0], [0, 1], [1, 1], [2, 1]], //Rotation Index 0, spawn position
			[[1, 0], [2, 0], [1, 1], [1, 2]], //Rotation Index 1
			[[0, 1], [1, 1], [2, 1], [2, 2]], //Rotation Index 2
			[[1, 0], [1, 1], [0, 2], [1, 2]], //Rotation Index 3
		],
		
		Center: [1, 1],
		OffsetGroup: 0,
	},

	S:{
		Rotation: [
			[[0, 1], [1, 0], [1, 1], [2, 0]], //Rotation Index 0, spawn position
			[[1, 0], [1, 1], [2, 1], [2, 2]], //Rotation Index 1
			[[1, 1], [2, 1], [0, 2], [1, 2]], //Rotation Index 2
			[[0, 0], [0, 1], [1, 1], [1, 2]], //Rotation Index 3
		],
		Center: [1, 1],
		OffsetGroup: 0,
	},

	Z:{
		Rotation: [
			[[0, 0], [1, 0], [1, 1], [2, 1]], //Rotation Index 0, spawn position
			[[2, 0], [1, 1], [2, 1], [1, 2]], //Rotation Index 1
			[[0, 1], [1, 1], [1, 2], [2, 2]], //Rotation Index 2
			[[1, 0], [0, 1], [1, 1], [0, 2]], //Rotation Index 3
		],
		Center: [1, 1],
		OffsetGroup: 0,
	},
	
	T:{
		Rotation: [
			[[1, 0], [0, 1], [1, 1], [2, 1]], //Rotation Index 0, spawn position
			[[1, 0], [1, 1], [2, 1], [1, 2]], //Rotation Index 1
			[[0, 1], [1, 1], [2, 1], [1, 2]], //Rotation Index 2
			[[1, 0], [0, 1], [1, 1], [1, 2]], //Rotation Index 3
		],
		Center: [1, 1],
		OffsetGroup: 0,
	},
	
	I:{
		Rotation: [
			[[0, 1], [1, 1], [2, 1], [3, 1]], //Rotation Index 0, spawn position
			[[2, 0], [2, 1], [2, 2], [2, 3]], //Rotation Index 1
			[[0, 2], [1, 2], [2, 2], [3, 2]], //Rotation Index 2
			[[1, 0], [1, 1], [1, 2], [1, 3]], //Rotation Index 3
		],
		Center: [1, 1],
		OffsetGroup: 1,
	},
	
	O:{
		Rotation: [
			[[1, 0], [2, 0], [1, 1], [2, 1]], //Rotation Index 0, spawn position
			[[1, 1], [1, 2], [2, 1], [2, 2]], //Rotation Index 1
			[[0, 0], [1, 0], [0, 1], [1, 1]], //Rotation Index 2
			[[0, 1], [1, 1], [0, 2], [1, 2]], //Rotation Index 3
		],
		Center: [1, 1],
		OffsetGroup: 2,
	}
	
}

const OFFSET_GROUPS = [

	// Group 0 //
	// Used by J L S T Z //
	[   // Test 1   Test 2   Test 3   Test 4   Test 5
		[ [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0] ], //Index 0
		[ [ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2] ], //Index 1
		[ [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0] ], //Index 2
		[ [ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2] ], //Index 3
	],
	
	// Group 1 //
	// Used by L //
	[   // Test 1   Test 2   Test 3   Test 4   Test 5
		[ [ 0, 0], [-1, 0], [ 2, 0], [-1, 0], [ 2, 0] ], //Index 0
		[ [-1, 0], [ 0, 0], [ 0, 0], [ 0, 1], [ 0,-2] ], //Index 1
		[ [-1, 1], [ 1, 1], [-2, 1], [ 1, 0], [-2, 0] ], //Index 2
		[ [ 0, 1], [ 0, 1], [ 0, 1], [ 0,-1], [ 0, 2] ], //Index 3
	],
	
	// Group 2 //
	// Used by O //
	[   // Test 1
		[ [ 0, 0] ], //Index 0
		[ [ 0,-1] ], //Index 1
		[ [-1,-1] ], //Index 2
		[ [-1, 0] ], //Index 3
	],
	
]


// Tensorflow Training Setup //

function get_model(){
	
}

const model = tf.sequential()

model.add( tf.layers.conv2d({
	
	inputShape: [BOARD_WIDTH, BOARD_HEIGHT, 1],
	kernelSize: 5,
	filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
	
}) )

/*
model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

model.add(tf.layers.conv2d({
	
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
	
 }));
  
model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
*/
model.add( tf.layers.flatten() )

const OUTPUT_CASES = 5

model.add(tf.layers.dense({
	units: OUTPUT_CASES,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax'
}));
const optimizer = tf.train.adam();
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
});

//model.save('localstorage')

const POINTS = [0, 50, 200, 500, 1000]
const PACE_MOD = [1.000, 0.970, 0.960, 0.953, 0.950]

var boardPos = []

for( let n = 0; n < BOARD_WIDTH; n++){	
	boardPos.push( Array(BOARD_HEIGHT).fill(0) )
}


async function get_model_prediction(){
	
	var data = [[]]
	
	for( let y = 0; y < BOARD_WIDTH; y++ ){

		data[0].push([])

		for( let x = 0; x < BOARD_HEIGHT; x++){
			data[0][y].push( [0] )
		}
	}
	
	//var out = model.predict(tf.tensor(data)).array()
	let out = await tf.randomNormal( [5] ).array()

	return out
}


/*--------------------------------------------------------------------------//
//		BOARD POSITION														//
//--------------------------------------------------------------------------//
//This stores the entire board state										//
//																			//
//Refer to board positions like this:										//
//																			//
//		boardPos[x][y]														//
//																			//
//Empty tiles are represented by a 0										//
//Filled tiles are represented by their color index							//
//																			//
//Easily iterate over the entire board with this neat code block			//
/*																			//

		for( let y = 0; y < BOARD_HEIGHT; y++ ){
			for( let x = 0; x < BOARD_WIDTH; x++){
				//Your code here					
			}
		}

*/																			//
//--------------------------------------------------------------------------*/ 



//------------------------------//
// POSITION CLASS 				//
//------------------------------//
// Holds an x, y coordinate as	//
// well as a color value.		//
//------------------------------//

class Position{
	
	//X position on the board
	x = 0;
	
	//Y position on the board
	y = 0;
	
	//color value, should correspond to one of the color constants above ^^
	color = 0;
	
	constructor(nx, ny, value){
		
		//Just pop in the arguments, easy peasy
		
		this.x = nx;
		this.y = ny;
		this.color = value;
		
	}
	
	//Self explanatory, just some getters and setters
	get x(){ return this.x; }
	get y(){ return this.y; }
	get color(){ return this.color }
	set x(val){ this.x = val }
	set y(val){ this.y = val }
	set color(val){ this.color = val }
	
	occupied(){ //Returns true if this position is occupied, returns false if movement in clear
		if( this.y >= BOARD_HEIGHT ){ return true; } //Treat the bottom of the board as occupied
		activePiece.forEach((element) =>{ //Ignore active pieces, i.e. don't collide with yourself
			if(element.x == x && element.y == y){ return false; }
		})
		return !boardPos[this.x][this.y] == EMPTY //Actual collision check
	}
	
	dropCheck(){ //Same as occupied, but check the space below
		if( this.y + 1 >= BOARD_HEIGHT ){ return true; } //Treat the bottom of the board as occupied
		return !boardPos[this.x][this.y + 1] == EMPTY //y+1 is the space below
	}
	
	sideCheck(dir){ //Same as occupied but checks to the right or left
		if(this.x + dir < 0 || this.x + dir >= BOARD_WIDTH){ return false; } //Treat the sides of the board as occupied
		return boardPos[this.x + dir][this.y] == EMPTY // dir will always be +1 or -1, corresponds to RIGHT or LEFT movement
	}
	
	bump(dir){ //Apply movement left or right (Don't do this until collision checking has passed)
		this.x += dir;
	}
	
	drop(){ //Apply downward movement. Happens each tick, or 
		this.y += 1;
	}
	
	//Static class functions let you run these functions on the class template instead of a class instance, which is useful in some situations
	
	static apBump( dir ){ //tries to move the active piece left or right after collision checks
	
		if(activePiece != null){ //Don't run this if there's no piece ready, otherwise this WILL crash
			var clear = true; //Switch, gets flipped to false if we collide with something
			
			activePiece.forEach((element) => { //Clear the active piece for easier collision checks
				boardPos[element.x][element.y] = EMPTY
			})
			
			activePiece.forEach((element) => { //Check each active piece's tile
				if( !element.sideCheck(dir) ){ //If we collide with something
					clear = false; //Flip the switch
				}
			})
			
			if(clear){ //If we are cleared for movement
				activePiece.forEach((element) => { //Move it over, and write down the new position
					element.bump( dir )
					boardPos[element.x][element.y] = element.color;
				})
				
				apCenter[X] += dir
				
			}else{
				activePiece.forEach((element) => { //Leave the piece where it was
					boardPos[element.x][element.y] = element.color
				})
			}
		}
		
	}
	
	static apDrop(){
		
		if(activePiece != null){
			
			//Here's where we're actually gonna try to drop the piece down one pip
			//First, clear the active piece, because it makes collision checks easier
			activePiece.forEach((element) => {
				boardPos[element.x][element.y] = EMPTY
			})
				
			var colCheck = true //Set false if collision check fails at any step
			
			//Check each tile of the active piece and make sure they're all clear to move
			//If they aren't clear, flip the colCkeck flag
			activePiece.forEach((element) => {
				if(element.dropCheck()){colCheck = false;}
			})
			
			if(colCheck){ //If we found nothing in the way earlier...
				
				//Bump it and write it down
				activePiece.forEach((element) => {
					element.drop()
					boardPos[element.x][element.y] = element.color
				})
				
				apCenter[Y] += 1
				
			}else{ //If we DID collide with something earlier...
				
				//Don't move and lock in the active piece's position
				activePiece.forEach((element) => {
					boardPos[element.x][element.y] = element.color
				})
				
				activePiece = null //Setting this to NULL will tell the game to spawn a new piece on the next logic step
				apCenter = null
				apLetter = null
				apRot = null
				
				//And after all that, we check to see if the player completed a row
				for( let row = 0; row < BOARD_HEIGHT; row++){ //For each row...
					
					var cRow = true; //Check flag
					
					for( let col = 0; col < BOARD_WIDTH; col++ ){//Look at each tile in that row...
						
						if( boardPos[col][row] == EMPTY ){ cRow = false; }//And flip the flag if any tiles in the row are empty
						
					}
					
					if( cRow ){ //If we looked over a row without finding an empty tile...
						
						rowsToClear.push( row ); //Mark down which row is full. It will be dealt with next logic step
						
					}
					
				}
				
				console.log( POINTS[ rowsToClear.length ] )
				score += POINTS[ rowsToClear.length ]
				pace = Math.ceil( pace * PACE_MOD[ rowsToClear.length ] )
				
				
				
			}
			
		}
		
	}
	

	
	static apHardDrop(){
		
		while( activePiece != null ){
			Position.apDrop();
		}
		
	}
	
	static apRotate( dir ){
		
		
		if( activePiece != null ){
			
			//Clear the active piece's position so it doesn't collide with itself during collision checks
			activePiece.forEach((element) => {
				boardPos[element.x][element.y] = EMPTY
			})
			
			var newRot = apRot + dir //The new rotation index we're trying to verify
			var colCheck = false //Mark if we've found a valid rotation index
			var validIndex = -1 //The valid rotation index we've found
			
			
			if( newRot < 0 ){ //Javascript doesn't support modulo on negative numbers, I guess
				newRot = 3
			}else{
				newRot = newRot % 4
			}
			
			var offsetPool = OFFSET_GROUPS[ PIECES[apLetter].OffsetGroup ][newRot]
			
			offsetPool.forEach( (oGroup, p) => {
			
				activePiece.forEach((element, n) => {
					
					colCheck = (colCheck) ? true : Position.occupied( PIECES[apLetter].Rotation[newRot][n][X] + apCenter[X] + offsetPool[p][X], PIECES[apLetter].Rotation[newRot][n][Y] + apCenter[Y] + offsetPool[p][Y])
					
				})
				
				if( !colCheck && validIndex == -1 ){
					validIndex = p
				}else{
					colCheck = false
				}
				
			})
			
			console.log( validIndex )
			
			if(validIndex != -1){ //This actually applies the rotation with the valid offset
				
				apRot += dir
				
				var newPos = PIECES[apLetter].Rotation[newRot]
				var nX = 0
				var nY = 0
				
				activePiece.forEach((element, n) => {
					nX = newPos[n][X] + apCenter[X] + offsetPool[validIndex][X]	//Update location
					nY = newPos[n][Y] + apCenter[Y] + offsetPool[validIndex][Y]	
					element.x = nX						//Set location
					element.y = nY
					boardPos[nX][nY] = element.color	//Record color
				})
			}else{
				activePiece.forEach((element, n) => {
					boardPos[ element.x ][ element.y ] = element.color
				})
			}
		}
	}
	
	static occupied(x, y){ //Allows collision checking on arbitrary locations without initializing a whole class for it
		try{
			if( this.y >= BOARD_HEIGHT ){ return true }
			activePiece.forEach((element) =>{
				if(element.x == x && element.y == y){
					return false
				}
			})
			return !boardPos[x][y] == EMPTY
		}catch(TypeError){
			return true
		}
	}
	
	static build(letter, index){ //Returns location classes using the piece data as a blueprints
		var blueprints = PIECES[letter].Rotation[0] //Gets the spawn positions of our desired piece
		
		return new Position( blueprints[index][X] + SPAWN_OFFSET[X], blueprints[index][Y] + SPAWN_OFFSET[Y], COLOR[letter] )
	}
	
}


var activePiece = null; //Holds a list of the tile locations of the active piece
var apCenter = null; //Keeps track of the piece center for rotation reasons
var apLetter = null; //Needed so we know which ratation table to use
var apRot = null; //Holds our current rotation index, will always be 0-3

/*var activePiece = {
	
	Pos: [ new Position(0, 0, 0) ],
	Center: new Position(0, 0, 0),
	Letter: null,
	Rotation: 0,
	Ready: false,
	
}*/


function firstLoad(){ //Runs once when the page loads
	
	//Record the starting time
	var st = new Date
	startTime = st.getTime()
	frame = 0
	
	//Build the starting piece queues
	
}

/*------------------------------//
// EVENT LISTERNER 				//
//------------------------------//
// Listens for key presses and	//
// reacts to them.				//
//------------------------------*/

function AI_make_move(){
	let use = []
	let bias = [2.5, 1.1, 0.9, 1, 0.2]
	for(let n = 0; n < lastMLoutput.length; n++){
		use.push( Math.abs(lastMLoutput[n] * bias[n]) )
	}
	console.log(use)
	let i = use.indexOf(Math.max(...use));
	console.log(i)
	switch(i){
		case 0:
			if(activePiece != null){ //This makes the piece fall instantly
				nextStep = curTime
			}
		break;
		
		case 1:
			Position.apBump(LEFT)
		break;
		
		case 2:
			Position.apBump(RIGHT)
		break;
		
		case 3:
			Position.apRotate(LEFT)
		break;
		
		case 4:
			Position.apRotate(RIGHT)
		break;
		
		default:
		
		break;
	}
}

window.addEventListener("keydown", function (event) {
	
	if(event.defaultPrevented){return}
		
		if( !AI_active ){
		
			switch (event.key) {
				
				case "ArrowDown":
					
					if(activePiece != null){ //This makes the piece fall instantly
						nextStep = curTime
					}
					
				break;
					
				case "ArrowUp":
					
					Position.apHardDrop()
					
				break;
					
				case "ArrowLeft":
			  
					Position.apBump(LEFT)
			  
				break;
				
				case "ArrowRight":
			  
					Position.apBump(RIGHT)
			  
				break;
				
				case "z":
			  
					Position.apRotate(LEFT)
			  
				break;
				
				case "x":
			  
					Position.apRotate(RIGHT)
			  
				break;
					
				default:
					return;
			}
		
		}
		
	event.preventDefault();
	
	})

function update(){
	
	//Called each frame, put game logic functions here
	
	curTime = new Date().getTime() //Keep the current game time up to date
	
	lastTime = curTime
	
	//Run this before the main game logic, blocks main logic from running this tick
	//Handles clearing completed rows
	switch( gameState ){
		
		case GAME_OVER:
		
		break;
		
		case GAME_PLAY:
		
			if( AI_active ){
				AI_think_step()
			}
		
			if( curTime > nextStep && rowsToClear.length > 0 ){
				
				//If scan line is at the top, start clearing the next row if there is one
				if(clearingRow == 0){
					clearingRow = rowsToClear[0];
				}
				
				//FIRST BLOCK: If scan line was moved down for the first time, clear the line.
				//SECOND BLOCK: Otherwise, don't clear the row and shift it down instead.
				if( clearingRow == rowsToClear[0] ){
					
					boardPos.forEach((element) => {
						element[clearingRow] = EMPTY;
					})
					
				}else{
					boardPos.forEach((element) => {
						element[clearingRow + 1] = element[clearingRow];
						element[clearingRow] = EMPTY;
					})
				}
				
				clearingRow -= 1; //Set target for next row
					
				//If we got to the top, remove the last completed row from the queue
				if(clearingRow == 0){
					rowsToClear.shift();
					rowsToClear.forEach((element) => {
						element += 1 //Don't forget that all the rows just got moved down, this corrects for that
					})
				}
				
				nextStep += pace * 0.1
				
			}else if( curTime > nextStep ){
				//Main game logic.
				//NEXTSTEP is when we should think next. This should only run when we're ready to think.
				
				//activePiece will be NULL whenever a piece has been placed but a new one has not yet spawned
				//This block spawns a new piece at the top of the board.
				if( activePiece == null ){

					var letter = queueA.shift() //Sets the desired letter to the next in the queue

					activePiece = [] //Prep activePiece to be filled with position classes
					apCenter = []
					
					if( queueA.length == 0 ){ //If we've run out of pieces in our list...
						queueA = queueB; //Shift the secondary list up
						queueB = buildQueue() //And replace it with a new list
						
						//The whole point of the secondary list thing is we can show the 'next-up' pieces to the player.
						//That's not implimented yet, but I'm trying to think ahead, y'know?
						
					}
					
					//This is kind of gross, try to ignore it
					//Spawns a piece by decoding the piece position constant
					//Check out the position.build() function for more stuff that probably doesn't make sense
					for( let n = 0; n < 4; n++ ){
						activePiece.push( Position.build( letter, n ) );
						if( Position.occupied(activePiece[n].x, activePiece[n].y )){ gameState = GAME_OVER }
					}
					apCenter = [3, -1]
					apLetter = letter
					apRot = 0
					
				}else{
					
					Position.apDrop();
					
				}
			
				nextStep = curTime + pace
				
			}
		break;
		
		case GAME_SETUP:
		
		break;
		
	}
	
}

function AI_think_step(){
	
	if(curTime > MLtrigger){
		get_model_prediction().then(
			function(value){ lastMLoutput = value }
		)
		
		if( lastMLoutput != null ){
			AI_make_move()
		}
		
		MLtrigger = curTime + ( pace / 10 )

		
	}
}

function draw(){
	
	//Called each frame, put graphics functions here
	
	var board = document.getElementById('board')
	var num = document.getElementById('num')
	var pframe = document.getElementById('frame')
	
	//Converts the boardPos data into one easy string, complete with color data
	board.innerHTML = boardToString();
	
	var paceMod = startingPace/pace
	
	num.innerHTML = score + "pts | " + paceMod.toFixed(2) + "x"
	if(gameState==GAME_PLAY){
		pframe.innerHTML = "Next Piece: " + ( queueA.length!=0 ? queueA[0] : queueB[0] )
	}else{
		pframe.innerHTML = "GAME OVER"
	}
	frame++
	
}

function buildQueue(){ //Returns a shuffled list of all the tetris pieces, each appearing once.
	
	var pieces = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']; //Starting pieces
	var q = []; //Array we're gonna return at the end
	var element; //Keeps track of our randomly chosen target
	
	while( pieces.length != 0 ){
		
		element = Math.floor( Math.random() * pieces.length ); //Pick a random index
		q.push( pieces[element] ); //Add the item at that index to the queue
		pieces.splice( element, 1 ); //Delete the element from the starting array
		
	}
	
	return q;
	
}

//Don't worry about this function, it's gonna get replaced by something less gross and complicated
function boardToString(){
	
	var b = ""
	
	for( let y = 0; y < BOARD_HEIGHT; y++ ){
		
		for( let x = 0; x < BOARD_WIDTH; x++){
			
			if( boardPos[x][y] == EMPTY ){
				if( y == clearingRow+1 ){
					b = b + "<b style='color:" + '#0000ff' + "'>□ </b>"
				}else{
					b = b + "<b style='color:#808080'>□ </b>"
				}
			}else{
				//console.log(COLOR_CODE[boardPos[x][y]])
				b = b + "<b style='color:" + COLOR_CODE[boardPos[x][y]] + "'>■ </b>"
			}
				
		}
		
		b = b + "<br>"
		
	}
	
	return b
	
}

function toggleAI(){
	if( AI_active ){
		AI_active = false
		document.getElementById('aiToggle').innerHTML = "Enable AI"
	}else{
		AI_active = true
		document.getElementById('aiToggle').innerHTML = "Disable AI"
	}
}

queueA = buildQueue();
queueB = buildQueue();

function mainLoop(){
	
	update(); //Game logic
	draw(); //Graphics
	requestAnimationFrame(mainLoop);
	
}

requestAnimationFrame(mainLoop)

//GLOBAL VARIABLES//

var startTime;	//Time when the program starts
var lastTime;	//Time of previous frame
var curTime;	//Time of current frame

var frame; //Number of the frame we are on right now
var pace = 200; //Automatic piece movement time (ms); Speeds up as the game continues
var nextStep = 0; //Keeps track of when the next step should occue

var activePiece = null; //Holds a list of the tile locations of the active piece
var queueA = [] //List of pieces to use next
var queueB = [] //Replaces A once A is empty, then is replaced by a new list

var rowsToClear = []; //Holds a list of the rows that are completed and need to be cleared
var clearingRow = 0; //Variable that controls row clearing. See the section on row clearing for more detailed analysis

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

//Spawn positions of the pieces
const PIECES = {
	
	L:[[0, 1], [1, 1], [2, 0], [2, 1]],
	
	// _ _ X //
	// X X X //
	
	J:[[0, 0], [0, 1], [1, 1], [2, 1]],
	
	// X _ _ //
	// X X X //
	
	S:[[0, 1], [1, 0], [1, 1], [2, 0]],
	
	// _ X X //
	// X X _ //
	
	Z:[[0, 0], [1, 0], [1, 1], [2, 1]],
	
	// X X _ //
	// _ X X //
	
	I:[[0, 0], [1, 0], [2, 0], [3, 0]],
	
	// X X X X //
	
	T:[[0, 1], [1, 0], [1, 1], [2, 1]],
	
	// _ X _ //
	// X X X //
	
	O:[[0, 0], [0, 1], [1, 0], [1, 1]],
	
	// X X //
	// X X //
	
}

var boardPos = []

for( let n = 0; n < BOARD_WIDTH; n++){	
	boardPos.push( Array(BOARD_HEIGHT).fill(0) )
}

//--------------------------------------------------------------------------//
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
//--------------------------------------------------------------------------// 

//TODO: Make boardpos use the position class

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
		activePiece.forEach((element) =>{
			if(element.x == this.x && element.y + 1 == this.y){ return false; } //Don't collide with yourself
		})
		return !boardPos[this.x][this.y + 1] == EMPTY //y+1 is the space below
	}
	
	//TODO: Side check doesn't completely work for some reason
	
	sideCheck(dir){ //Same as occupied but checks to the right or left
		if(this.x + dir < 0 || this.x + dir >= BOARD_WIDTH){ console.log("hit wall"); return true; } //Treat the sides of the board as occupied
		activePiece.forEach((element) =>{
			if(element.x == this.x + dir && element.y == this.y){ console.log("self collision" + " " + this.x + " " + this.y); return false; } //Don't collide with yourself
		})
		
		console.log("Standard check")
		return !boardPos[this.x + dir][this.y] == EMPTY // dir will always be +1 or -1, corresponds to RIGHT or LEFT movement
	}
	
	bump(dir){ //Apply movement left or right (Don't do this until collision checking has passed)
		this.x += dir;
	}
	
	//Static class functions let you run these functions on the class template instead of a class instance, which is useful in some situations
	
	static occupied(x, y){ //Allows collision checking on arbitrary locations without initializing a whole class for it
		if( this.y >= BOARD_HEIGHT ){ return true }
		activePiece.forEach((element) =>{
			if(element.x == x && element.y == y){
				return false
			}
		})
		return !boardPos[x][y] == EMPTY
	}
	
	static build(piece, index){ //Returns location classes using the piece data as a blueprints
		
		return new Position( PIECES[piece][index][X], PIECES[piece][index][Y], COLOR[piece] )
	}
	
}

function firstLoad(){ //Runs once when the page loads
	
	//Record the starting time
	var st = new Date
	startTime = st.getTime()
	frame = 0
	
	//Build the starting piece queues
	queueA = buildQueue();
	queueB = buildQueue();
	
	
	
}

//------------------------------//
// EVENT LISTERNER 				//
//------------------------------//
// Listens for key presses and	//
// reacts to them.				//
//------------------------------//

window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented) {
		return; // Do nothing if the event was already processed
	}

		switch (event.key) {
			
			case "ArrowDown":
				// code for "down arrow" key press.
			break;
				
			case "ArrowUp":
				
				rotatePiece()
				
			break;
				
			case "ArrowLeft":
		  
				bump(LEFT);
		  
			break;
			
			case "ArrowRight":
		  
				bump(RIGHT)
		  
			break;
				
			default:
			
				return; // Quit when this doesn't handle the key event.
		}

	// Cancel the default action to avoid it being handled twice
	event.preventDefault();
	}, true);
	// the last option dispatches the event to the listener first,
	// then dispatches event to window

function update(){
	
	//Called each frame, put game logic functions here
	
	curTime = new Date().getTime() //Keep the current game time up to date
	
	lastTime = curTime
	
	//Run this before the main game logic, blocks main logic from running this tick
	//Handles clearing completed rows
	if( curTime > ( nextStep - pace ) && rowsToClear.length > 0 ){
		
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
		
		nextStep += pace
		
	}
	
	//Main game logic.
	//NEXTSTEP is when we should think next. This should only run when we're ready to think.
	if( curTime > nextStep ){
		
		//activePiece will be NULL whenever a piece has been placed but a new one has not yet spawned
		//This block spawns a new piece at the top of the board.
		if( activePiece == null ){
			
			var letter = queueA.shift() //Sets the desired letter to the next in the queue
			activePiece = [] //Prep activePiece to be filled with position classes
			
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
				
			}
			
		}
		
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
				element.y += 1
				boardPos[element.x][element.y] = element.color
			})
			
		}else{ //If we DID collide with something earlier...
			
			//Don't move and lock in the active piece's position
			activePiece.forEach((element) => {
				boardPos[element.x][element.y] = element.color
			})
			
			activePiece = null //Setting this to NULL will tell the game to spawn a new piece on the next logic step
			
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
			
		}
	
		nextStep = curTime + pace
		
	}
	
}

function draw(){ //MAJDA: Put your stuff here :)
	
	//Called each frame, put graphics functions here
	
	var board = document.getElementById('board')
	
	//Converts the boardPos data into one easy string, complete with color data
	board.innerHTML = boardToString();
	
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

//Tries to move the active piece left or right based on user input
function bump( dir ){
	
	if(activePiece != null){ //Don't run this if there's no piece ready, otherwise this WILL crash
		var clear = true; //Switch, gets flipped to false if we collide with something
		
		activePiece.forEach((element) => { //Check each active piece's tile
			//console.log("!")
			if( !element.sideCheck(dir) ){ //If we collide with something
				clear = false; //Flip the switch
			}
		})
		
		if(clear){ //If we are cleared for movement
			activePiece.forEach((element) => { //Clear the current position
				boardPos[element.x][element.y] = EMPTY
			})
			activePiece.forEach((element) => { //Move it over, and write down the new position
				element.bump( dir )
				boardPos[element.x][element.y] = element.color;
			})
		}
	}
}

function rotatePiece(){
	
	//Piece rotation code goes here
	
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

function mainLoop(){
	
	update(); //Game logic
	draw(); //Graphics
	requestAnimationFrame(mainLoop);
	
}

requestAnimationFrame(mainLoop)
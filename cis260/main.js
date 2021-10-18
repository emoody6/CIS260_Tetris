var startTime;	//Time when the program starts
var lastTime;	//Time of previous frame
var curTime;	//Time of current frame

var frame;
var pace = 200; //Automatic piece movement time (ms); Speeds up as the game continues
var nextStep = 0; //Keeps track of when the next step should occue

var activePiece = null; //Holds a list of the tile locations of the active piece
var queueA = [] //List of pieces to use next
var queueB = [] //Replaces A once A is empty, then is replaced by a new list

var rowsToClear = [];
var clearingRow = 0;

const BOARD_HEIGHT = 20;
const BOARD_WIDTH = 10;

const EMPTY = 0;
const COLOR = {
	Z: 1,
	L: 2,
	O: 3,
	S: 4,
	I: 5,
	J: 6,
	T: 7,
}

const RED = 1;
const ORANGE = 2;
const YELLOW = 3;
const GREEN = 4;
const CYAN = 5;
const BLUE = 6;
const PURPLE = 7;

const COLOR_CODE = {
	1: 	'#e03030',
	2: 	'#e08030',
	3: 	'#e0e030',
	4:	'#30e030',
	5:	'#30e0e0',
	6:	'#3030e0',
	7: 	'#e030e0',
	
}

const LEFT = -1;
const RIGHT = 1;

const X = 0
const Y = 1

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

console.log(boardPos)

//------------------------------//
// POSITION CLASS 				//
//------------------------------//
// Holds an x, y coordinate as	//
// well as a color value.		//
//------------------------------//

class Position{
	
	x = 0;
	y = 0;
	color = 0;
	
	constructor(nx, ny, value){
		
		this.x = nx;
		this.y = ny;
		this.color = value;
		
	}
	
	get x(){ return this.x; }
	get y(){ return this.y; }
	get color(){ return this.color }
	set x(val){ this.x = val }
	set y(val){ this.y = val }
	set color(val){ this.color = val }
	
	occupied(){ //Returns true if this position is empty
		if( this.y >= BOARD_HEIGHT ){ return true } //Treat the bottom of the board as occupied
		activePiece.forEach((element) =>{
			if(element.x == x && element.y == y){ return false }
		})
		return !boardPos[this.x][this.y] == EMPTY
	}
	
	dropCheck(){ //Same as occupied, but check the space below
		if( this.y + 1 >= BOARD_HEIGHT ){ return true } //Treat the bottom of the board as occupied
		activePiece.forEach((element) =>{
			if(element.x == this.x && element.y + 1 == this.y){ return true } //Don't collide with yourself
		})
		return !boardPos[this.x][this.y + 1] == EMPTY
	}
	
	sideCheck(dir){ //Same as occupied but checks to the right or left
		if(this.x + dir < 0 || this.x + dir >= BOARD_WIDTH){ return true; } //Treat the sides of the board as occupied
		activePiece.forEach((element) =>{
			if(element.x == this.x && element.y == this.y){ return false; } //Don't collide with yourself
		})
		return !boardPos[this.x + dir][this.y] == EMPTY
	}
	
	bump(dir){ //Apply movement left or right
		this.x += dir;
	}
	
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
				// code for "up arrow" key press.
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
			activePiece = []
			
			if( queueA.length == 0 ){
				queueA = queueB;
				queueB = buildQueue()
			}
			
			for( let n = 0; n < 4; n++ ){
				
				activePiece.push( Position.build( letter, n ) );
				
			}
			
		}
		
		activePiece.forEach((element) => {
			boardPos[element.x][element.y] = EMPTY
		})
			
		var colCheck = true //Set false if collision check fails
		
		activePiece.forEach((element) => {
			if(element.dropCheck()){colCheck = false;}
		})
		
		if(colCheck){ //If nothing is in the way
			
			activePiece.forEach((element) => {
				element.y += 1
				boardPos[element.x][element.y] = element.color
			})
			
		}else{
			
			activePiece.forEach((element) => {
				boardPos[element.x][element.y] = element.color
			})
			
			activePiece = null
			
			for( let row = 0; row < BOARD_HEIGHT; row++){ //Mark rows for clearing after each piece is placed
				
				var cRow = true;
				
				for( let col = 0; col < BOARD_WIDTH; col++ ){//iterate over each piece within each row
					
					if( boardPos[col][row] == 0 ){ cRow = false; }
					
				}
				
				if( cRow ){
					
					rowsToClear.push( row );
					console.log( "clear row " + row )
					
				}
				
			}
			
		}
			
		
	
		nextStep = curTime + pace
		
	}
	
}

function draw(){
	
	//Called each frame, put graphics functions here
	
	var board = document.getElementById('board')
	
	board.innerHTML = boardToString();
	
	frame++
	
}

function buildQueue(){
	
	var pieces = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']; //Starting pieces
	var q = [];
	var element;
	
	while( pieces.length != 0 ){
		
		element = Math.floor( Math.random() * pieces.length ); //Pick a random index
		q.push( pieces[element] ); //Add the item at that index to the queue
		pieces.splice( element, 1 ); //Delete the element
		
	}
	
	return q;
	
}

function bump( dir ){
	
	if(activePiece != null){
		var clear = true;
		
		activePiece.forEach((element) => {
			if( !element.sideCheck(dir) ){
				clear = false;
			}
		})
		
		if(!clear){
			activePiece.forEach((element) => {
				boardPos[element.x][element.y] = EMPTY
			})
			activePiece.forEach((element) => {
				element.bump( dir )
				boardPos[element.x][element.y] = element.color;
			})
		}
	}
}

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
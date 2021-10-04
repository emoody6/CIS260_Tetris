var startTime;	//Time when the program starts
var lastTime;	//Time of previous frame
var curTime;	//Time of current frame
var frame;

function firstLoad(){
	
	//Store start time so we can see how long the game has been running
	var st = new Date
	
	startTime = st.getTime()
	frame = 0
	
}

function update(){
	
	//Called each frame, put game logic functions here
	
	var p = document.getElementById('num');
	
	curTime = new Date().getTime()
	
	p.innerHTML = ( curTime - lastTime ) + " ms since last frame</p><p>" + (( curTime - startTime ) / 1000).toFixed(2) + " seconds since script loaded";
	
	lastTime = curTime
	
}

function draw(){
	
	//Called each frame, put graphics functions here
	
	var p = document.getElementById('frame')
	
	frame++
	
	p.innerHTML = frame + " frames rendered"
	
}

function mainLoop(){
	
	update(); //Game logic
	draw(); //Graphics
	requestAnimationFrame(mainLoop);
	
}

requestAnimationFrame(mainLoop)
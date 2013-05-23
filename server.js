// Initialisation 
var express = require('express');
var app = express()
	,http = require('http')
	,server = http.createServer(app)
	,io = require('socket.io').listen(server);
var port = 8080;

var players = Array();

function Player(socket,username){
	this.socket = socket;
	this.username = username;
	this.score = 0;
	this.x=10;
	this.life= 100;
	
	

}

function Monster(id,x){
	this.id = id;
	this.x = x;
	this.isDead = false;
}

var monsterID = 0;
var monsters = Array();
// Setting the root locationwarn  - error raised: Error: listen EADDRINUSE
app.configure(function() {
		app.use(express.static(__dirname+'/'));
	});

// Launching the server
server.listen(port);

console.log('listening on port :'+port);
app.get('/',function(req,res){
			res.sendfile(__direname+'/index.html');
		console.log("sent page index.html");
	});
	
	
	
io.sockets.on('connection', function (socket) { 

	socket.on('adduser', function(username){  
	
        // store the username in the socket session for this client  
        list = Array();
        for(i=0;i<players.length;i++){
        	list.push(new Array(players[i].username,players[i].score,players[i].x,players[i].life));
        }
        socket.emit("initplayers",list);
        
        players.push(new Player(io.socket,username));
        socket.broadcast.emit("newplayer",username);
        socket.username = username;  
        console.log("connection de "+username);
    	}); 
    	socket.on('moveship',function(x){
    
    		for(i=0;i<players.length;i++){
    			if(players[i].username == socket.username){
    				players[i].x = x;
    				// broadcast
    				socket.broadcast.emit('playerx',players[i].username,players[i].x);
    				break;
    			}
    		}
    	});
	socket.on('shipshot',function(x){
		socket.broadcast.emit('playershot',x);
	});
    	 });

function newMonster(){
	var ms = new Monster(monsterID++,10+(Math.random()*940));
	monsters.push(ms);
	io.sockets.emit("newMonster",ms.id,ms.x);
}
   setInterval(function(){
newMonster()},3000);

var levelImgLoaded = false;
var loadedImages = 0;
var keys = Array(false,false,false);
var shots = Array();
var monsters = Array();
var players = Array();
var monster = new Image();
monster.src = "img/level/monster2.png";
var shipCenter = new Image();
shipCenter.src = "img/level/ship/ship_center.png";
var ship = new Ship(10,410);
  

function Player(username,x){
	this.name = username;
	this.x = x;
	this.score = 0;
	this.life = 100;

	this.render = function(ctx){
		ctx.drawImage(shipCenter,this.x,420);	
	}
}

var socket = null;
var nb = -1;

$(document.body).on('keydown', function(e) {
    switch (e.which) {
        // key code for left arrow
        case 37:
            	keys = Array(true,false,false);
		
		break;
        
        // key code for right arrow
        case 39:
		keys = Array(false,true,false);
		
		break;  
	case 32:
		keys = Array(false,false,true);
		break;
	}
	});

function GameEngine(width,height){
	this.name ="";
	this.screenWidth = width;
	this.screenHeight = height;
	this.level = 1;
	this.images = {};
	this.splash = new Image();
	this.splash.src="img/splash.jpg";
	this.isInitilised = false;

	this.renderState  =  new Splash(width,height);
	this.level = new Level(width,height);
	this.count = 100;
	this.setName = function(name){
		socket = io.connect(); 				
		this.name = name;
		this.level.setName(name);
		socket.on('connect', function(){  
			socket.emit('adduser', name);  
    		});

		socket.on('initplayers',function(list){
			for(i=0;i<list.length;i++){
				players.push(new Player(list[i][0],list[i][2]));
				players[i].score = list[i][1];
				players[i].life = list[i][2];
				
			}
		});
		socket.on('newplayer',function(username){
			players.push(new Player(username,10));
		});

		socket.on('playerx',function(username,x){
			for(i=0;i<players.length;i++){
				if(players[i].name == username){
					players[i].x = x;
					break;
				}
			}
		});
		socket.on("playershot",function(x){
			shots.push(new Shot(x,450));
			shots[shots.length-1].isMine = false;
		});
		socket.on("newMonster",function(id,x){
			monsters.push(new Monster(id,x,0));
		});


	
	}
	this.update=function(){
		// update
		this.renderState.update();
		if(!this.isInitialised && levelImgLoaded){
			this.isInitialised = true;
		}
		if(this.isInitialised&& this.count > 0){
			this.count--;
		}
		if(this.count == 0){
			this.renderState = this.level;
			this.count = -1;
		}

		for(i = 0;i<shots.length;i++){
			if(shots[i].y<=0){
				shots.splice(i,1);
				continue;
			}
			shots[i].update();
			var xC = shots[i].x+6;
			var xY = shots[i].y+7;
			for(j=0;j<monsters.length;j++){
				if(xC >= monsters[j].x && xC <= (monsters[j].x+144)){
					if(xY  >= monsters[j].y && xY <= (monsters[j].y+144)){
						monsters[j].isDead = true;
					}
				}
			}
		}
		for(i=0;i<monsters.length;i++){
			monsters[i].update();
		}


	
		
	}

	this.render= function(ctx){
		this.renderState.render(ctx);
		for(i = 0;i<shots.length;i++){
			shots[i].render(ctx);
		}
	

	}
		
}

/*
	Spash Screen
*/
function Splash(width,height){
	this.count = 0;
	this.img =  new Image();
	this.img.src ="img/splash.jpg";

	this.screenWidth = width;
	this.screenHeight = height;

	this.width = 500;
	this.height = 50;
	this.texts = new Array("Loading","Loading .","Loading ..","Loading ...");
	this.textIndex = 0;

	this.update = function(){
		this.count++;
		if(this.count >= 20){
			this.count = 0;
			this.textIndex++;
			if(this.textIndex >= 4){
				this.textIndex = 0;
			}
		}
	}
	this.render = function(ctx){
		ctx.drawImage(this.img,0,0);
		ctx.fillStyle="#000000";
		ctx.fillRect(230,325,this.width,this.height);
		ctx.fillStyle = "white";
  		ctx.font = "Bold 25px Lobster";
  		ctx.fillText(this.texts[this.textIndex], 400, 355);
	}
}

/*
	The main Level
*/

function Level(width,height){
	
	this.bg =new Image();
	this.setName= function(name){
		ship.name =name;
	}
	this.bg.src="img/bgLv1.jpg";
	this.bgPos=-1100;
	this.bg.onload=function(){
		imageLoaded();
	}
	
	this.update =function(){
	this.bgPos+=0.05;
	if(this.bgPos == 0){
		this.bgPos = -1100;
		
	}
	ship.update();
	}
	this.render = function(ctx){
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,960,500);
		ctx.drawImage(img,-100,this.bgPos);
		ship.render(ctx);
		ctx.fillStyle = "white";
  		ctx.font = "Bold 25px Lobster";

		for(i=0;i<players.length;i++){
			ctx.fillText(players[i].name,players[i].x,410);
			ctx.drawImage(shipCenter,players[i].x,410);
		}
			for(i=0;i<monsters.length;i++){
			if(monsters[i].isDead){
				continue;
			}
			monsters[i].render(ctx);
		}
	}
}


// the ship
function Ship(x,y){
	this.x = x;
	this.y = y;
	this.life = 100;
	this.score = 0;
	
	this.imgCenter = new Image();
	this.left = false;
	this.right  = false;

	this.imgCenter.src ="img/level/ship/ship_center.png";
	this.imgCenter.onload = function(){
		imageLoaded();
	}
	this.imgLeft = new Image();
	this.imgRight = new Image();
	this.shooting = false;

	this.imgLeft.src = "img/level/ship/ship_left2.png";
	this.imgRight.src= "img/level/ship/ship_right2.png"
	this.imgRight.onload = function(){imageLoaded();}
	this.imgLeft.onload = function(){imageLoaded();}

	this.update = function(){
		if(keys[0]){
			this.x-=7;
			if(this.x <= 100){
				this.x=100;
			}
			keys[0] = true;
			this.left = true;
			socket.emit("moveship",this.x);
			return;
		}
		if(keys[1]){
			this.x+=7;
			if(this.x >= 860){
				this.x = 860;
			}
			keys[1] = false;
			this.right = true;
			socket.emit("moveship",this.x);
			return;
		}
		if(keys[2]){
			shots.push(new Shot(this.x+45,this.y+40));
			socket.emit("shipshot",this.x+45);
			keys[2] = false;
		}

	}
	this.render = function(ctx){
		ctx.fillStyle = "white";
  		ctx.font = "Bold 25px Lobster";
		ctx.fillText("Score :"+this.score,10,30);
		
		ctx.fillRect(10,60,110,15);
		ctx.fillStyle="green";
		ctx.fillRect(15,62,this.life,10);
		ctx.fillStyle="yellow";
		ctx.fillText(this.name,this.x,this.y+5);
		if(this.left){
			ctx.drawImage(this.imgLeft,this.x,this.y);
			this.left = false;
			
		}else if(this.right){
			ctx.drawImage(this.imgRight,this.x,this.y);
			this.right = false;
		}else{
		ctx.drawImage(this.imgCenter,this.x,this.y);
		}
	}
}

function Monster(id,x,y){
	this.Id = id;
	this.x = x;
	this.y= y;
	this.speed = 5

	this.update= function(){
		this.y+=this.speed;
	}
	this.render = function(ctx){
		ctx.drawImage(monster,this.x,this.y);
	}

}

function Shot(x,y){
	this.x = x;
	this.y= y;
	this.speed = 15;
	this.isMine = true;
	this.img = new Image();
	this.img.src = "img/level/shot.png";
	this.update = function(){
		this.y-=this.speed;
	}
	this.render = function(ctx){
		ctx.drawImage(this.img,this.x,this.y);		
	}
}

/*
	Callback funtion for all images
*/
function imageLoaded(){
	loadedImages++;
	if(loadedImages  == 2){
		levelImgLoaded = true;
	}
}


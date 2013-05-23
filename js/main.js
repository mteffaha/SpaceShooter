var width=960;
var height=500;
var img = new Image();
img.src="img/bgLv1.jpg";
var bgPos = -1100;

var engine =  new GameEngine(960,500);
var then = Date.now();
var interval = 40;
$(document).ready(function(){

		// -------------------------------------------- Initialisation 

		/*
		   Menu Related script
		 */
		$("#menu li").click(function(){
			$("#menu li").each(function(){
				$(this).removeClass("selected");
				});
			$(this).addClass("selected");
			// Scroll to desired Window
			var index = $(this).index();
			$("#windows li").each(function(){
				if($(this).hasClass("visible")){
				$(this).stop().animate({opacity:0},500);

				$($("#windows li").get(index)).animate({opacity:100},500,function(){
					$($("#windows li").get(index)).addClass("visible");
					});
				}

				});	
			});

		// --------------------------------------------- End of Initialisation
	$("#canvas")[0].width = 960;
	$("#canvas")[0].height=500;
	//setInterval("gameLoop()",1);
	$("#valider").click(function(){
		if(!$("#messageBox input").val()){
			alert("Please type a valid name Empty name is not");	
			
		}else{
			engine.setName($("#messageBox input").val());
			$("#floater").remove();
			setInterval("gameLoop()",1);


		}
	});
});

function gameLoop(){

now = Date.now();
	
    delta = now - then;
     
    if (delta > interval) {
        	var c=$("#canvas")[0];
	var ctx=c.getContext("2d");
	ctx.drawImage(img,-100,bgPos);
	bgPos+=0.01;
	engine.update();
	engine.render(ctx); 
        then = now - (delta % interval);
    }
}

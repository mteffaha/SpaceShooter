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
	});
	
	// --------------------------------------------- End of Initialisation
});
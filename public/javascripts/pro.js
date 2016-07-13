$(document).ready(function() {

	/*****************************************
				  INITIALIZATION
	*****************************************/
    //TODO: Probably don't need this
	//$("input[required]").requirify();
	
	
	$("input[type=password]").showPasswordify({
		control: $(".show-password")
	});



	/*****************************************
					LISTENERS
	*****************************************/

	//click "Show/hide password"
	$(".show-password").click(function() {
		$(this).toggleText("Show", "Hide");
	});

});
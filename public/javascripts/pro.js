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
    
	$("#btn_register").click(auth.register);
	$("#btn_login").click(auth.login);
	$("#btn_checkout").click(stripe.launch);
});
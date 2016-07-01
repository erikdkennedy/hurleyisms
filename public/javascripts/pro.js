$(document).ready(function() {

	/*****************************************
				  INITIALIZATION
	*****************************************/

	$("input[required]").requirify();
	$("input[type=email]").emailify();
	$("input[type=email]").uniquify("This email has already been taken.  <a href='#' data-modal='login-modal'>Login</a> if it's yours");
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
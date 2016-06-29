$(document).ready(function() {

	/*****************************************
				  INITIALIZATION
	*****************************************/

	$("input[type=email], input[type=password]").requirify();
	$("input[type=email]").emailify();
	$("input[type=password]").showPasswordify({
		control: $(".show-password")
	});

	$("#email").simpleEditify({
		onSaveSuccess: function() {
			$.createToast("New email address saved!  Check your inbox for Hurleyisms's message to confirm this email is yours.");
		}
	});

	$("#password").simpleEditify({
		onOpen: function() {
			$(".show-password").removeClass("hidden");
		},
		onClose: function() {
			$(".show-password").addClass("hidden");
		},
		onSaveSuccess: function() {
			$.createToast("New password saved!");
		}
	});



	/*****************************************
					LISTENERS
	*****************************************/

	//TODO Andrew remove
	$(document).keyup(function(e) {
		if (e.which === 84) $("body").toggleClass("is-monthly is-lifetime");
	});

	//click "Show/hide password"
	$(".show-password").click(function() {
		$(this).toggleText("Show password", "Hide password");
	});
});
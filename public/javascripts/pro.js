$(document).ready(function () {

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
	$(".show-password").click(function () {
		$(this).toggleText("Show", "Hide");
	});
	$("#btn_checkout").click(stripe.launch);
	$(".privacy").click(function () {
		window.open("/privacy")
	});
	$(".terms").click(function () {
		window.open("/terms")
	});

	function getQueryStringValue(key) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0] === key) return pair[1];
		}
		return false;
	}
	
	//check for "Enter new password" query string
	if (getQueryStringValue("coupon") !=false) {
		window.lifetime = false;
		console.log("Coupon is there");
		$.openModal("signup-modal");
		$("#coupon-code").val(getQueryStringValue("coupon"));
	}
});
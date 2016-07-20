$(document).ready(function() {

	$(window).scroll(function() {
		//TODO don't show animations on mobile
		//TODO cache offsets
		//TODO remove listener after it's triggered
		if ($(window).scrollTop() + 0.35*$(window).height() > $("#card-1").offset().top) {
			$(".card").addClass("flipped");
		}

		if ($(window).scrollTop() + 0.75*$(window).height() > $("#device-img-1").offset().top) {
			$(".device-img").addClass("slide-in");
		}
	});
	$("#btn_login").click(auth.login);
});
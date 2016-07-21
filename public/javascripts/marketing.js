$(document).ready(function() {

	function triggerScrollingAnimations() {

		if (isMobile()) {
			removeScrollListener();
			$(".card").addClass("flipped");
			$(".device-img").addClass("slide-in");
			return false;
		}

		var animationsComplete = 0;
		var totalAnimations = 2;

		//TODO cache offsets
		if ($(window).scrollTop() + 0.35*$(window).height() > $("#card-1").offset().top) {
			$(".card").addClass("flipped");
			animationsComplete++;
		}

		if ($(window).scrollTop() + 0.75*$(window).height() > $("#device-img-1").offset().top) {
			$(".device-img").addClass("slide-in");
			animationsComplete++;
		}

		if (animationsComplete === totalAnimations) removeScrollListener();;
	}

	function isMobile() {
		return window.matchMedia("(max-width: 568px)").matches;
	}

	function removeScrollListener() {
		$(window).off("scroll");
	}

	$(window).scroll(function() {
		triggerScrollingAnimations();
	});

	triggerScrollingAnimations();

	$("#btn_login").click(auth.login);
});
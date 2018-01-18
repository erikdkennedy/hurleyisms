$(document).ready(function() {
	$("body").toggleClass("is-trial", !auth.isLoggedIn());
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
		return window.matchMedia("(max-width: 800px)").matches;
	}

	function removeScrollListener() {
		$(window).off("scroll");
	}

	$(window).scroll(function() {
		triggerScrollingAnimations();
	});

	triggerScrollingAnimations();

	$(".privacy").click(function () {
	    window.open("/privacy")
	});
	$(".terms").click(function () {
	    window.open("/terms")
	});
});
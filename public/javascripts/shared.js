jQuery.fn.extend({
	addError: function(errorString, classString) {
		return this.each(function() {
			classString = classString || "";
			if (classString.length) classString = " " + classString;

			//remove any current errors
			$(this).next(".error").remove();

			//add the error
			$(this).after("<div class='error" + classString + "'>" + errorString + "</div>");
		});
	},
	removeError: function() {
		return this.each(function() {
			$(this).next(".error").remove();
		});
	}
});

$(document).ready(function() {

	/***********************************
				MODAL FUNCTIONS
	***********************************/

	//TODO remove in final code
	$("body").keyup(function(e) {
		if (e.keyCode === 76) {
			$(this).toggleClass("is-logged-in");
		}
	});

	//open modal
	$("a[data-modal]").click(function() {

		//if there's a current modal open, close it
		if ($("body").hasClass("has-modal-open")) {
			$.closeModal();
		}

		//figure out which modal we're talking about here
		var which = $(this).attr("data-modal");
		var $modal = $(".modal").filter("#" + which);

		//open the modal
		$modal.addClass("is-visible");

		//adding a class to the body allows us to lock scrolling
		$("body").addClass("has-modal-open");
	});

	//click on close button
	$(".modal a.modal__close").click(function() {
		$.closeModal();
	});

	//click on background screen to close modal
	$(".modal").click(function() {
		$.closeModal();
	});

	//click somewhere on modal window
	$(".modal__window").click(function(e) {
		e.stopPropagation(); //stop propagation so the modal isn't closed
	});

	//press Esc while modal is open
	$(document).keyup(function(e) {
		if (e.keyCode === 27 && $("body").hasClass("has-modal-open")) {
			$.closeModal();
		}
	});

	$.closeModal = function() {
		$(".modal.is-visible").removeClass("is-visible");
		$("body").removeClass("has-modal-open");
	};
});
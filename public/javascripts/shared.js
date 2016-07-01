jQuery.fn.extend({
	addError: function(errorString, classString) {
		var error = errorString || "This field is invalid";
		return this.each(function() {
			classString = classString || "";
			if (classString.length) classString = " " + classString;

			//remove any current errors
			$(this).next(".error").remove();

			//add the error
			$(this).after("<div class='error" + classString + "'>" + error + "</div>");
		});
	},
	removeError: function() {
		return this.each(function() {
			$(this).next(".error").remove();
		});
	},
	isTextField: function() {
		return $(this).first().is("input[type=text], input[type=email], input[type=password], textarea");
	},
	toggleText: function(string1, string2) {
		return this.each(function() {
			var text = $(this).text();
			if (text === string1) {
				$(this).text(string2);
			} else if (text === string2) {
				$(this).text(string1);
			}
		});
	},
	hasError: function() {
		return $(this).first().next().hasClass("error");
	},
	requirify: function(errorMessage) {

		var error = errorMessage || "This is a required field";
		return this.each(function() {
			$(this).blur(function(e) {
				if ($(this).val().length === 0) {
					$(this).addError(error);
					e.stopImmediatePropagation();
				} else
					$(this).removeError();
			});

			if (this.form) {
				var $input = $(this);
				$(this.form).submit(function(e) {
					if ($input.val().length === 0) {
						$input.addError(error);
						e.stopImmediatePropagation();
						return false;
					} else {
						$input.removeError();
						e.preventDefault();
					}
				});
			}
		});
	},
	emailify: function(errorMessage) {
		var error = errorMessage || "Please enter a valid email address";

		function isValidEmail(email) {
			var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return filter.test(email);
		}

		return this.each(function() {
			$(this).blur(function(e) {
				if (isValidEmail( $(this).val() ))
					$(this).removeError();
				else {
					$(this).addError(error);
					e.stopImmediatePropagation();
				}
			});

			if (this.form) {
				var $input = $(this);
				$(this.form).submit(function(e) {
					if (isValidEmail( $input.val() )) {
						$input.removeError();
						e.preventDefault();
					} else {
						$input.addError(error);
						e.preventDefault();
						e.stopPropagation();
						return false;
					}
				});
			}
		});
	},
	uniquify: function(errorMessage) {
		var error = errorMessage || "This is already taken";

		function isUnique(valueToCheck) {
			//TODO Andrew - check for uniqueness on server instead
			return valueToCheck !== "erik.d.kennedy@gmail.com";
		}

		return this.each(function() {
			$(this).blur(function(e) {
				if (isUnique( $(this).val() ))
					$(this).removeError();
				else {
					$(this).addError(error);
					e.stopImmediatePropagation();
				}
			});

			if (this.form) {
				var $input = $(this);
				$(this.form).submit(function(e) {
					if (isUnique( $input.val() )) {
						$input.removeError();
						e.preventDefault();
					} else {
						$input.addError(error);
						return false;
					}
				});
			}
		});
	},
	showPasswordify: function(options) {
		return this.each(function() {
			if (typeof options.control === "undefined") return false;

			var $password = $(this);
			var $control = options.control;

			$control.click(function() {
				if ($password.prop("type") === "text")
					$password.prop("type", "password");
				else if ($password.prop("type") === "password")
					$password.prop("type", "text");
			});
		});
	},
	simpleEditify: function(options) {
		var settings = $.extend({
			onOpen: function() {},
			onClose: function() {},
			onSaveSuccess: function() {}
		}, options);

		return this.each(function() {

			//CLICK "EDIT"
			$(this).on("click", ".simple-edit__edit", function() {
				var $simpleEdit = $(this).closest(".simple-edit");
				startEditingSimpleEdit($simpleEdit);
			});

			//PRESS "ESC"
			$(this).on("keyup", ".simple-edit__input", function(e) {
				if (e.which === 27) {
					var $simpleEdit = $(this).closest(".simple-edit");
					cancelEditingSimpleEdit($simpleEdit);
				}
			});

			//PRESS "CMD + ENTER" TO SAVE
			$(this).on("keydown", ".simple-edit__input", function(e) {
				if (e.which === 13 && e.metaKey) {
					var $simpleEdit = $(this).closest(".simple-edit");
					saveSimpleEdit($simpleEdit);
				}
			});

			//CLICK "SAVE"
			$(this).on("click", ".simple-edit__save", function() {
				$(this).closest("form").submit();
			});

			//SUBMIT FORM
			$(this).closest("form").submit(function() {
				if ($(this).find(".error").length === 0)  {
					var $simpleEdit = $(this).find(".simple-edit");
					saveSimpleEdit($simpleEdit);
				}
			});

			/************** LISTENER LOGIC **************/

			function startEditingSimpleEdit($simpleEdit) {
				var $input = $simpleEdit.find("input");
				$input
						.data("initial-value", $input.val())
						.removeAttr("disabled")
						.focus();
				$simpleEdit.find(".simple-edit__edit")
						.toggleText("Edit", "Save")
						.toggleClass("btn--blue btn--green simple-edit__edit simple-edit__save");

				settings.onOpen();
			}

			function cancelEditingSimpleEdit($simpleEdit) {
				var $input = $simpleEdit.find("input");
				var initialValue = $input.data("initial-value");
				$input.val(initialValue);

				$input.prop("disabled", true);
				$simpleEdit.find(".simple-edit__save")
						.toggleText("Edit", "Save")
						.toggleClass("btn--blue btn--green simple-edit__edit simple-edit__save");

				settings.onClose();
			}

			function saveSimpleEdit($simpleEdit) {
				if ($simpleEdit.hasError()) return false;

				$simpleEdit.find("input").prop("disabled", true);
				$simpleEdit.find(".simple-edit__save")
						.toggleText("Edit", "Save")
						.toggleClass("btn--blue btn--green simple-edit__edit simple-edit__save");

				settings.onClose();
				settings.onSaveSuccess();
			}
		});
	}
});

$.createToast = function(innerHTML, lifespanInMS, className) {

	function setStyleBeforeAnimation($el) {
		return window.getComputedStyle($el[0]).opacity;
	}

	var lifespan = lifespanInMS || 3000;
	var className = className || "";

	$("body").append("<div class='toast " + className + "'>" + innerHTML + "</div>");
	var $toast = $(".toast");
	setStyleBeforeAnimation($toast);
	$toast.addClass("appear");

	setTimeout(function() {
		$toast
				.removeClass("appear")
				.on("transitionend", function() {
					$(this).remove();
				});
	},
	lifespan);
};

$(document).ready(function() {

	/***********************************
				  LISTENERS
	***********************************/

	$("a[href=#]").click(function(e) {
		e.preventDefault();
	});



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
	$(document).on("click", "a[data-modal]", function() {

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
	$(".modal").click(function(e) {
		if ($(e.toElement).is(".modal")) $.closeModal();
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
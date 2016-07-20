jQuery.fn.extend({
    addError: function (errorString, classString) {
        var error = errorString || "This field is invalid";
        return this.each(function () {
            classString = classString || "";
            if (classString.length) classString = " " + classString;

            //remove any current errors
            $(this).next(".error").remove();

            //add the error
            $(this).after("<div class='error" + classString + "'>" + error + "</div>");
        });
    },
    removeError: function () {
        return this.each(function () {
            $(this).next(".error").remove();
        });
    },
    isTextField: function () {
        return $(this).first().is("input[type=text], input[type=email], input[type=password], textarea");
    },
    toggleText: function (string1, string2) {
        return this.each(function () {
            var text = $(this).text();
            if (text === string1) {
                $(this).text(string2);
            } else if (text === string2) {
                $(this).text(string1);
            }
        });
    },
    hasError: function () {
        return $(this).first().next().hasClass("error");
    },
    requirify: function (errorMessage) {
        var error = errorMessage || "This is a required field";
        var valid = true;
        this.each(function () {
            if ($(this).val().length === 0) {
                $(this).addError(error);
                valid = false;
                return false;
            }
            $(this).removeError();
        });
        return valid;
    },
    emailify: function (errorMessage) {
        var error = errorMessage || "Please enter a valid email address";

        function isValidEmail(email) {
            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return filter.test(email);
        }
        if (isValidEmail($(this).val())) {
            $(this).removeError();
            return true;
        }

        $(this).addError(error);
        return false;

    },

    //required arg "control" - jQuery element controlling show/hide
    //optional args "showText", "hideText"
    showPasswordify: function (options) {
        return this.each(function () {
            if (typeof options.control === "undefined") return false;

            var $password = $(this);
            var $control = options.control;
            var showText = options.showText || "Show";
            var hideText = options.hideText || "Hide";

            $control.click(function () {
                if ($password.prop("type") === "text") {
                    $password.prop("type", "password");
                    $control.text(showText);
                }
                else if ($password.prop("type") === "password") {
                    $password.prop("type", "text");
                    $control.text(hideText);
                }
            });
        });
    },
    simpleEditify: function (options) {
        var settings = $.extend({
            onOpen: function () { },
            onClose: function () { },
            onSaveSuccess: function () { }
        }, options);

        return this.each(function () {

            //CLICK "EDIT"
            $(this).on("click", ".simple-edit__edit", function () {
                var $simpleEdit = $(this).closest(".simple-edit");
                startEditingSimpleEdit($simpleEdit);
            });

            //PRESS "ESC"
            $(this).on("keyup", ".simple-edit__input", function (e) {
                if (e.which === 27) {
                    var $simpleEdit = $(this).closest(".simple-edit");
                    cancelEditingSimpleEdit($simpleEdit);
                }
            });

            //PRESS "CMD + ENTER" TO SAVE
            $(this).on("keydown", ".simple-edit__input", function (e) {
                if (e.which === 13 && e.metaKey) {
                    var $simpleEdit = $(this).closest(".simple-edit");
                    saveSimpleEdit($simpleEdit);
                }
            });

            //CLICK "SAVE"
            $(this).on("click", ".simple-edit__save", function () {
                if ($(this).find(".error").length === 0) {
                    var $simpleEdit = $(this).closest(".simple-edit");
                    var callback = function () {
                        saveSimpleEdit($simpleEdit);
                    };
                    if (options.onSave) { options.onSave(callback); }
                    else { callback(); }
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

$.createToast = function (innerHTML, lifespanInMS, className) {

    function setStyleBeforeAnimation($el) {
        return window.getComputedStyle($el[0]).opacity;
    }

    var lifespan = lifespanInMS || 3000;
    var className = className || "";

    $("body").append("<div class='toast " + className + "'>" + innerHTML + "</div>");
    var $toast = $(".toast");
    setStyleBeforeAnimation($toast);
    $toast.addClass("appear");

    setTimeout(function () {
        $toast
				.removeClass("appear")
				.on("transitionend", function () {
				    $(this).remove();
				});
    },
	lifespan);
};

$(document).ready(function () {

    /***********************************
				  LISTENERS
	***********************************/

    $("a[href=#]").click(function (e) {
        e.preventDefault();
    });



    /***********************************
				MODAL FUNCTIONS
	***********************************/

    //open modal
    $(document).on("click", "a[data-modal]", function () {
        //TODO determine better way of doing this 
        window.lifetime = false;
        if ($(this).is("[lifetime]")) { window.lifetime = true; }
        if ($(this).closest(".line").length > 0) {
            window.editid = $(this).closest(".line").attr("name");
        }

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
    $(".modal a.modal__close").click(function () {
        $.closeModal();
    });

    //click on background screen to close modal
    $(".modal").click(function (e) {
        if ($(e.toElement).is(".modal")) $.closeModal();
    });

    //press Esc while modal is open
    $(document).keyup(function (e) {
        if (e.keyCode === 27 && $("body").hasClass("has-modal-open")) {
            $.closeModal();
        }
    });

    $.closeModal = function () {
        $(".modal.is-visible").removeClass("is-visible");
        $("body").removeClass("has-modal-open");
    };
});
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-77534503-1', 'auto');
ga('send', 'pageview');


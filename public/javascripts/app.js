$(document).ready(function() {
	/*****************************************
				  HELPERS & INIT
	*****************************************/
    var cachedLines = [];

    var profanity = false;

	var audienceTypes = {
		MEN: 0,
		WOMEN: 1,
		KIDS: 2
	};

	var lineBeforeEdits;

	//cached for perf
	var $progressBar = $("#progress-bar");
	var $progressBarFill = $("#progress-bar__fill");

	//variables for the lines session
	var audience;
	var progressBarSpeed;
	var progressBarAnimation;
	var lastRepaintTime;
	var charCountOfDisplayedLines;

	function displayTextareaCharRemaining() {
		var $textarea = $("section.submit textarea");
		var charLimit = $textarea.attr("maxlength");
		var charTyped = $textarea.val().length;
		var charRemaining = charLimit - charTyped;
		var noCharRemaining = charRemaining < 1;

		$("section.submit .char-remaining").text(charRemaining);
		$("section.submit label[for=the-line] .form-control__label-hint")
				.toggleClass("error", noCharRemaining);
	}

	//submit-a-line init
	displayTextareaCharRemaining();



    /*****************************************
                   DataAccess
    *****************************************/
	function updateCache(callback)
	{
	    $.getJSON('app/data/' + audience + '/' + profanity, function (data) {
	        cachedLines = data;
	        callback();
	    });
	}
	function sendLine(line, callback) {
	    $.post('app/add',line, function (data) {
	        callback();
	    });
	}
	function rate(id, rating, callback) {
	    $.getJSON('app/rate/' + id + '/' + rating, function (data) {
	        callback();
	    });
	}



	/*****************************************
			   LISTENERS - SPLASH
	*****************************************/

	//start session button
	$("a.begin-session").click(function() {
		audience = Number($(this).attr("data-audience-type"));
		updateCache(function () {
		    changeScreen("lines");
		    startPlay();
		});
	});

	//flip rating switch
	$(".switch").click(function() {
	    $(this).toggleClass("active");
	    profanity = $(this).hasClass("active");
	});

	//click "new line" btn
	$(".btn.add-line").click(function() {
		changeScreen("submit");

		//TODO remove... should be handled elsewhere
		if (isLoggedIn()) {
			enableLineSubmissionControls();
		} else {
			disableLineSubmissionControls();
		}
	});

	function changeScreen(screenName) {
		var $screen = $("section." + screenName);

		if (!$screen.hasClass("active")) {
			$("section.active").removeClass("active");
			$screen.addClass("active");
		}
	}

	function isLoggedIn() {
		return $("body").hasClass("is-logged-in");
	}

	function enableLineSubmissionControls() {
		var $page = $("section.submit");

		$page.find("input, textarea").removeAttr("disabled");
		$page.find(".btn--green").removeAttr("disabled");
		$page.find(".switch").removeClass("disabled");
	}

	function disableLineSubmissionControls() {
		var $page = $("section.submit");

		$page.find("input, textarea").attr("disabled", true);
		$page.find(".btn--green").attr("disabled", true);
		$page.find(".switch").addClass("disabled");
	}



	/*****************************************
			   LISTENERS - SUBMIT
	*****************************************/

	//switch logged in/out -- TODO: remove this
	$(document).keyup(function(e) {
		if (e.keyCode === 76) {
			if (isLoggedIn()) {
				enableLineSubmissionControls();
			} else {
				disableLineSubmissionControls();
			}
		}
	});

	//close this page
	$("section.submit a.close").click(function() {
		changeScreen("splash");
	});

	//type a line
	$("section.submit textarea").keyup(function() {
		displayTextareaCharRemaining();
	});

	//submit a line
	$("section.submit .add-line").click(function() {

		$(".error").remove();

		var errorSpanHTML = " <span class='error'>Required</span>";

		if ($("#the-line").val() === "") {
			$("label[for=the-line]").append(errorSpanHTML);
		}

		if ($(".checkbox-list input:checked").length === 0) {
			$(".form-control--audience .form-control__label").append(errorSpanHTML);
		}

		if ($(".error").length === 0) {
		    sendNewLine(function () {
		        resetSubmitForm();
		    });
		} else {
			var $firstError = $(".error").first();
			scrollToElement($firstError);
		}
	});

	function sendNewLine(callback)
	{
	    var line = {};
	    line.line = $("#the-line").val();
	    line.men = $('#audience-men').is(":checked");
	    line.women = $('#audience-women').is(":checked");
	    line.kids = $('#audience-kids').is(":checked");
	    line.profanity = $('#switch-pg').hasClass("active");
	    line.author = $("#your-name").val();
	    sendLine(line, callback);
	}
	function resetSubmitForm() {
		$(".line-added").addClass("fade-in");
		$("#the-line").val("");
		scrollToElement( $("body") );
	}

	function scrollToElement($element) {
		$("html, body").animate({
			scrollTop: $element.offset().top
		}, 250);
	}

	//on submit-a-line animation complete, remove the animating class
	$("body").on("webkitAnimationEnd oanimationend msAnimationEnd animationend", function() {
		$(".line-added").removeClass("fade-in");
	});



	/*****************************************
				LISTENERS - LINES
	*****************************************/

	function startPlay() {
		writeAudienceType();
		writeNewLines();
		determineProgressBarSpeed();
		startProgressBar();
	}

	function writeAudienceType() {
		var audienceName;

		if (audience === audienceTypes.MEN) audienceName = "men";
		if (audience === audienceTypes.WOMEN) audienceName = "women";
		if (audience === audienceTypes.KIDS) audienceName = "kids";

		$("span.audience").text(audienceName);
	}

	function writeNewLines() {
		var lines = fetchAndDisplayLines();
		updateCharCountOfDisplayedLines(lines);
	}

	function fetchAndDisplayLines() {
		var maxNumLines = isMobile() ? 1 : 5;
		var lines = [];
		var usedIDs = [];
		var noMoreLinesFit = false;

		var $divForLine = $("main .line").first();

		for (var i=0; i<maxNumLines && i<cachedLines.length; i++) {
			var line;

			while (1) {
				line = getRandomLine(); //TODO filter by audience, profanity, and rating

				if (objNotInArray(line._id, usedIDs)) {
					usedIDs.push(line._id);
					lines.push(line);
					break;
				}
			}

			if ($divForLine.length === 0) $divForLine = createDivForLine();
			writeLineToDiv(line, $divForLine);

			noMoreLinesFit = determineIfNoMoreLinesFit($divForLine);
			if (noMoreLinesFit) break;

			$divForLine = $divForLine.next();
		}

		return lines;
	}

	function isMobile() {
		return window.matchMedia("(max-width: 568px)").matches;
	}

	function getRandomLine() {
		var randomIndex = Math.floor(Math.random() * cachedLines.length);
		return cachedLines[randomIndex];
	}

	function objNotInArray(obj, array) {
		return array.indexOf(obj) === -1;
	}

	function createDivForLine() {
		return $("#lines .line:last-child").clone().appendTo("#lines");
	}

	function writeLineToDiv(line, $div) {
		$div.find(".line__text").html(line.line);
		$div.find(".line__byline .author").text(line.author);
		$div.attr("name", line._id);
	}

	function determineIfNoMoreLinesFit($lastLine) {
		if (lineOverlapsFooter($lastLine)) {
			if (isMobile()) {
				shrinkLineUntilItFits($lastLine);
			} else {
				$lastLine.remove();
			}
			return true;
		} else {
			return false;
		}
	}

	function lineOverlapsFooter($line) {
		var lastLineBounds = $line[0].getBoundingClientRect();
		var footerContentHeight = $(".lines__footer").height() + $("#progress-bar").height();
		var heightForLines = window.innerHeight - footerContentHeight;

		return lastLineBounds.bottom > heightForLines;
	}

	function shrinkLineUntilItFits($line) {
		var fontSizeString = $line.children(".line__text").css("font-size");
		var fontSize = parseInt(fontSizeString, 10);

		while (lineOverlapsFooter($line)) {
			fontSize -= 2;
			$line.children(".line__text").css("font-size", fontSize);
		}
	}

	function updateCharCountOfDisplayedLines(lines) {
		charCountOfDisplayedLines = lines
				.map(function(eachLine) {
					return eachLine.line.length;
				})
				.reduce(function(a, b) {
					return a + b;
				});
	}

	function determineProgressBarSpeed() {
		progressBarSpeed = $("input[type=range]").val();
	}

	function startProgressBar() {
		progressBarAnimation = requestAnimationFrame(updateProgressBar);
	}

	function stopProgressBar() {
		cancelAnimationFrame(progressBarAnimation);
		lastRepaintTime = null;
	}

	function resetProgressBar() {
		stopProgressBar();
		lastRepaintTime = null;
		$progressBarFill.width(0);
	}

	function updateProgressBar(currentTime) {
		var newPercentage = determineNewPercentage(currentTime);

		if (newPercentage > 100) {
			newPercentage = 0;
			displayNewPageOfLines();
		}

		var newPercentageString = newPercentage + "%";
		$progressBarFill.css("width", newPercentageString);

		lastRepaintTime = currentTime;

		startProgressBar();
	}

	function determineNewPercentage(currentTime) {
		if (!lastRepaintTime) lastRepaintTime = currentTime;
		var timeSinceLastRepaint = currentTime - lastRepaintTime;

		var oldPercentage = $progressBarFill.width() / $progressBar.width() * 100;
		var magicConstant = isMobile() ? 0.5 : 1.0;
		var delta = magicConstant*progressBarSpeed*timeSinceLastRepaint/charCountOfDisplayedLines;
		return oldPercentage + delta;
	}

	function displayNewPageOfLines() {
		resetLineRatings();
		removeLineResizing();
		writeNewLines();
		scrollToElement( $("body") );
	}

	function resetLineRatings() {
		$(".thumbs-up.active, .thumbs-down.active").removeClass("active");
	}

	function removeLineResizing() {
		$("#lines .line__text").removeAttr("style");
	}

	//click a line to edit is (admins only)
	$(document).on("click", ".line__text", function() {
		startEditingLine( $(this) );
	});

	function startEditingLine($textBox) {
		if (!isAdmin()) return false;

		var progressBarWasRunning = !!lastRepaintTime;

		var $currentlyEditingLines = $(".line__textarea");
		if ($currentlyEditingLines.length) cancelLineChanges();

		pause();

		//TODO cancel other lines being edited

		lineBeforeEdits = $textBox.html(); //.replace(/"/g, '\\"');
		var height = $textBox.outerHeight();
		$textBox.replaceWith("<textarea class='line__textarea' spellcheck='true' style='height: " + height + "px;'>" + lineBeforeEdits + "</textarea>");

		$(".line__textarea")
				.data("prog-bar-running", progressBarWasRunning)
				.focus();
	}

	function isAdmin() {
		return $("body").hasClass("is-admin");
	}

	//press "a" to toggle admin mode (prototype only)
	//TODO Andrew - remove this when admin mode is implemented
	$(document).keyup(function(e) {
		if (e.which === 65 && !isTextArea(e.target)) $("body").toggleClass("is-admin");
	});

	function isTextArea(el) {
		return $(el).is("textarea");
	}

	//press cmd+enter to save changes to edited line
	$(document).on("keydown", ".line__textarea", function(e) {
		if (e.which === 13 && e.metaKey) saveLineChanges();
	});

	//press save button to save changes to edited line
	$(document).on("click", ".line__save-change", function() {
		saveLineChanges();
	});

	//press esc to cancel changes to edited line
	$(document).on("keydown", ".line__textarea", function(e) {
		if (e.which === 27) cancelLineChanges();
	});

	//press cancel button to cancel changes to edited line
	$(document).on("click", ".line__cancel-change", function() {
		cancelLineChanges();
	});

	function saveLineChanges() {
		startProgressBarIfItWasRunning();
		var $textarea = $(".line__textarea");
		$textarea.replaceWith("<p class='line__text'>" + $textarea.val() + "</p>");
	}

	function startProgressBarIfItWasRunning() {
		var progBarWasRunning = $(".line__textarea").data("prog-bar-running");
		if (progBarWasRunning) unpause();
	}

	function cancelLineChanges() {
		startProgressBarIfItWasRunning();
		$(".line__textarea").replaceWith("<p class='line__text'>" + lineBeforeEdits + "</p>");
	}

	//swipe left (mobile)
	$(window).on("swipeleft", function() {
		flipToNextPage();
	});

	function flipToNextPage() {
		resetProgressBar();
		$progressBarFill.width(0);
		displayNewPageOfLines();

		if (!$(".pause").hasClass("is-paused")) {
			startProgressBar();
		}
	}

	//stop this session
	$("section.lines a.close").click(function() {
		changeScreen("splash");
		resetProgressBar();
		$(".pause").removeClass("is-paused");
	});

	//click thumbs up/down
	$(document).on("click", ".thumbs-up, .thumbs-down", function() {
	    var id = $(this).parents(".line").attr("name");
	    var rating = $(this).hasClass("thumbs-up");
	    var elem = $(this);
	    rate(id, rating, function () {
	        elem.toggleClass("active");
	        if (elem.hasClass("active")) {
	            elem.siblings(".btn.active").removeClass("active");
	        }
	    });
	});

	//change speed
	$("input[type=range]").change(function() {
		progressBarSpeed = $(this).val();
	});

	//press pause (or unpause) button
	$(".pause").click(function() {
		if ($(this).hasClass("is-paused")) {
			unpause();
		} else {
			pause();
		}
	});

	function pause() {
		$(".pause").addClass("is-paused");
		stopProgressBar();
	}

	function unpause() {
		$(".pause").removeClass("is-paused");
		startProgressBar();
	}

	//flip to next page
	$(".next").click(function() {
		flipToNextPage();
	});
});



/*****************************************
			   ADMIN PAGE
*****************************************/

//click "Approve"
$("#admin-table .btn:first-child").click(function() {
	$(this).toggleClass("active");

	if ($(this).hasClass("active")) {
		$(this).text("Approved");
	} else {
		$(this).text("Approve");
	}
});

//click "Delete"
$("#admin-table .btn:last-child").click(function() {
	window.confirm("Delete this line?  This cannot be undone.");
});

//TODO click editable field

//ban IP address
$("#admin-table .ban-ip").click(function() {
	window.confirm("Ban this IP?  This will also delete all this IP's lines, and cannot be undone.");
});
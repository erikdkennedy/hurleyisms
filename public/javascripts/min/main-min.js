$(document).ready(function(){function e(){var e=$("section.submit textarea"),n=e.attr("maxlength"),t=e.val().length,i=n-t,o=1>i;$("section.submit .char-remaining").text(i),$("section.submit label[for=the-line] .form-control__label-hint").toggleClass("error",o)}function n(e){var n=$("section."+e);n.hasClass("active")||($("section.active").removeClass("active"),n.addClass("active"))}function t(){$(".line-added").addClass("fade-in"),$("#the-line").val(""),i($("body"))}function i(e){$("html, body").animate({scrollTop:e.offset().top},250)}function o(){r(),a(),g(),v()}function r(){var e;O===E.MEN&&(e="men"),O===E.WOMEN&&(e="women"),O===E.KIDS&&(e="kids"),$("span.audience").text(e)}function a(){var e=s();b(e)}function s(){for(var e=l()?1:5,n=[],t=[],i=!1,o=$("main .line").first(),r=0;e>r;r++){for(var a;;)if(a=c(),u(a.id,t)){t.push(a.id),n.push(a);break}if(0===o.length&&(o=h()),d(a,o),i=f(o))break;o=o.next()}return n}function l(){return window.matchMedia("(max-width: 568px)").matches}function c(){var e=Math.floor(Math.random()*N.length);return N[e]}function u(e,n){return-1===n.indexOf(e)}function h(){return $("#lines .line:last-child").clone().appendTo("#lines")}function d(e,n){n.find(".line__text").html(e.line),n.find(".line__byline .author").text(e.author)}function f(e){return m(e)?(l()?p(e):e.remove(),!0):!1}function m(e){var n=e[0].getBoundingClientRect(),t=$(".lines__footer").height()+$("#progress-bar").height(),i=window.innerHeight-t;return n.bottom>i}function p(e){for(var n=e.children(".line__text").css("font-size"),t=parseInt(n,10);m(e);)t-=2,e.children(".line__text").css("font-size",t)}function b(e){F=e.map(function(e){return e.line.length}).reduce(function(e,n){return e+n})}function g(){W=$("input[type=range]").val()}function v(){M=requestAnimationFrame(w)}function y(){cancelAnimationFrame(M)}function k(){y(),D=null,A.width(0)}function w(e){var n=C(e);n>100&&(n=0,_());var t=n+"%";A.css("width",t),D=e,v()}function C(e){D||(D=e);var n=e-D,t=A.width()/T.width()*100,i=l()?1:3,o=i*W*n/F;return t+o}function _(){x(),H(),a(),i($("body"))}function x(){$(".thumbs-up.active, .thumbs-down.active").removeClass("active")}function H(){$("#lines .line__text").removeAttr("style")}function P(){k(),A.width(0),_(),$(".pause").hasClass("is-paused")||v()}var N=[{id:0,line:"Flare your right nostril...<br/><br/>Wait, you did both.  Just the right one.",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"},{id:1,line:"Don't get ahead of yourself– you'll get ahead of me!",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"},{id:2,line:"Look like you WON the marathon.<br/><br/>Now look like you LOST the marathon.",men:!0,women:!0,kids:!1,profanity:!1,rating:0,author:"Peter Hurley"},{id:3,line:"Think like a pedestrian!",men:!0,women:!0,kids:!1,profanity:!1,rating:0,author:"Peter Hurley"},{id:4,line:"Look like you're operating from a different train of thought!",men:!0,women:!0,kids:!1,profanity:!1,rating:0,author:"Peter Hurley"},{id:5,line:"TWILCH to the left!...<br/><br/>Ahh, so THAT'S what a twilch is!",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"},{id:6,line:"Smirch up a bit.  That's the PERFECT amount of smirch!<br/><br/>Now DOUBLE the smirch.  Ahh, smirchfection!",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"},{id:7,line:"Forehead UP, chin DOWN, forehead UP, chin DOWN...<br/><br/>Why are you nodding?",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"}],E={MEN:0,WOMEN:1,KIDS:2},T=$("#progress-bar"),A=$("#progress-bar__fill"),O,W,M,D,F;e(),$("a.begin-session").click(function(){O=Number($(this).attr("data-audience-type")),n("lines"),o()}),$(".switch").click(function(){$(this).toggleClass("active")}),$(".btn.add-line").click(function(){n("submit")}),$("section.submit a.close").click(function(){n("splash")}),$("section.submit textarea").keyup(function(){e()}),$("section.submit .add-line").click(function(){$(".error").remove();var e=" <span class='error'>Required</span>";if(""===$("#the-line").val()&&$("label[for=the-line]").append(e),0===$(".checkbox-list input:checked").length&&$(".form-control--audience .form-control__label").append(e),0===$(".error").length)t();else{var n=$(".error").first();i(n)}}),$("body").on("webkitAnimationEnd oanimationend msAnimationEnd animationend",function(){$(".line-added").removeClass("fade-in")}),$(window).on("swipeleft",function(){P()}),$("section.lines a.close").click(function(){n("splash"),k(),$(".pause").removeClass("is-paused")}),$(document).on("click",".thumbs-up, .thumbs-down",function(){$(this).toggleClass("active"),$(this).hasClass("active")&&$(this).siblings(".btn.active").removeClass("active")}),$("input[type=range]").change(function(){W=$(this).val()}),$(".pause").click(function(){$(this).toggleClass("is-paused"),$(this).hasClass("is-paused")?y():v()}),$(".next").click(function(){P()})});
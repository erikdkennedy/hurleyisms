$(document).ready(function(){function n(n){var e=$("section."+n);e.hasClass("active")||($("section.active").removeClass("active"),e.addClass("active"))}function e(){$(".line-added").addClass("fade-in"),$("#the-line").val(""),i($("body"))}function i(n){$("html, body").animate({scrollTop:n.offset().top},250)}function t(){o(),a(),m(),p()}function o(){var n;_===H.MEN&&(n="men"),_===H.WOMEN&&(n="women"),_===H.KIDS&&(n="kids"),$("span.audience").text(n)}function a(){var n=r();f(n)}function r(){for(var n=s()?1:5,e=[],i=[],t=!1,o=$("main .line").first(),a=0;n>a;a++){for(var r;;)if(r=l(),c(r.id,i)){i.push(r.id),e.push(r);break}if(0===o.length&&(o=u()),h(r,o),t=d(o))break;o=o.next()}return e}function s(){return window.matchMedia("(max-width: 568px)").matches}function l(){var n=Math.floor(Math.random()*C.length);return C[n]}function c(n,e){return-1===e.indexOf(n)}function u(){return $("#lines .line:last-child").clone().appendTo("#lines")}function h(n,e){e.find(".line__text").html(n.line),e.find(".line__byline .author").text(n.author)}function d(n){var e=n[0].getBoundingClientRect(),i=$(".lines__footer").height()+$("#progress-bar").height(),t=window.innerHeight-i;return e.bottom>t?(s()||n.remove(),!0):!1}function f(n){O=n.map(function(n){return n.line.length}).reduce(function(n,e){return n+e})}function m(){x=$("input[type=range]").val()}function p(){E=requestAnimationFrame(v)}function b(){cancelAnimationFrame(E)}function g(){b(),T=null,N.width(0)}function v(n){var e=y(n);e>100&&(e=0,k());var i=e+"%";N.css("width",i),T=n,p()}function y(n){T||(T=n);var e=n-T,i=N.width()/P.width()*100,t=s()?1:3,o=t*x*e/O;return i+o}function k(){w(),a(),i($("body"))}function w(){$(".thumbs-up.active, .thumbs-down.active").removeClass("active")}var C=[{id:0,line:"Flare your right nostril...<br/><br/>Wait, you did both.  Just the right one.",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"},{id:1,line:"Don't get ahead of yourself– you'll get ahead of me!",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"},{id:2,line:"Look like you WON the marathon.<br/><br/>Now look like you LOST the marathon.",men:!0,women:!0,kids:!1,profanity:!1,rating:0,author:"Peter Hurley"},{id:3,line:"Think like a pedestrian!",men:!0,women:!0,kids:!1,profanity:!1,rating:0,author:"Peter Hurley"},{id:4,line:"Look like you're operating from a different train of thought!",men:!0,women:!0,kids:!1,profanity:!1,rating:0,author:"Peter Hurley"},{id:5,line:"TWILCH to the left!...<br/><br/>Ahh, so THAT'S what a twilch is!",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"},{id:6,line:"Smirch up a bit.  That's the PERFECT amount of smirch!<br/><br/>Now DOUBLE the smirch.  Ahh, smirchfection!",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"},{id:7,line:"Forehead UP, chin DOWN, forehead UP, chin DOWN...<br/><br/>Why are you nodding?",men:!0,women:!0,kids:!0,profanity:!1,rating:0,author:"Peter Hurley"}],H={MEN:0,WOMEN:1,KIDS:2},P=$("#progress-bar"),N=$("#progress-bar__fill"),_,x,E,T,O;$("a.begin-session").click(function(){_=Number($(this).attr("data-audience-type")),n("lines"),t()}),$(".switch").click(function(){$(this).toggleClass("active")}),$(".btn.add-line").click(function(){n("submit")}),$("section.submit a.close").click(function(){n("splash")}),$("section.submit .add-line").click(function(){$(".error").remove();var n=" <span class='error'>Required</span>";if(""===$("#the-line").val()&&$("label[for=the-line]").append(n),0===$(".checkbox-list input:checked").length&&$(".form-control--audience .form-control__label").append(n),0===$(".error").length)e();else{var t=$(".error").first();i(t)}}),$("body").on("webkitAnimationEnd oanimationend msAnimationEnd animationend",function(){$(".line-added").removeClass("fade-in")}),$("section.lines a.close").click(function(){n("splash"),g()}),$(document).on("click",".thumbs-up, .thumbs-down",function(){$(this).toggleClass("active"),$(this).hasClass("active")&&$(this).siblings(".btn.active").removeClass("active")}),$("input[type=range]").change(function(){x=$(this).val()}),$(".pause").click(function(){$(this).toggleClass("is-paused"),$(this).hasClass("is-paused")?b():p()}),$(".next").click(function(){g(),N.width(0),k(),$(".pause").hasClass("is-paused")||p()})});
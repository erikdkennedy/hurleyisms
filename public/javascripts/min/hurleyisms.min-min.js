var auth=function(){var e={},t=function(){var e=$("#signup-modal input[type=email]").emailify()&&$("#signup-modal input[required]").requirify(),t=$("#chk_terms").requirifyCheck("You must accept the terms and privacy policy");return t&&e};e.register=function(e){if(e.preventDefault(),t()){var n={};n.email=$("#email").val(),n.password=$("#password").val(),n.name=$("#name").val();var i=$("#coupon-code").val();i&&(n.couponcode=i),$.post("auth/register",n).done(function(e){$.openModal("checkout-modal")}).error(function(e){$("#signup-modal input[type=email]").addError("This email has already been taken.  <a href='#' data-modal='login-modal'>Login</a> if it's yours")})}};var n=function(){return $("#login-modal input[type=email]").emailify()&&$("#login-modal input[required]").requirify()};e.login=function(){if(n){var e={};e.email=$("#login__email-address").val().toLowerCase(),e.password=$("#login__password").val(),$.post("auth/login",e).done(function(e){document.location.href="/app"}).error(function(e){$("#login-modal input[type=email]").addError("Email or password incorrect")})}},e.logout=function(){$.post("auth/logout").done(function(){document.location.href="/"})},e.cancel=function(e){$.post("auth/cancel").done(function(){e&&e()})},e.updateEmailAddress=function(e,t){$.post("auth/email",{email:e}).done(function(){t()})},e.updatePassword=function(e,t){$.post("auth/password",{password:e}).done(function(){t&&t()})},e.forgotPassword=function(e,t){$.post("auth/forgotPassword",{email:e}).done(function(){t&&t()})},e.isLoggedIn=function(){var e=i();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3}return!1},e.isAdmin=function(){var e=i();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3&&t.admin}return!1},e.isMonthly=function(){var e=i();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3&&"monthly"===t.type}return!1},e.isLifeTime=function(){var e=i();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3&&"lifetime"===t.type}return!1},e.loggedInEmail=function(){var e=i();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3?t.email:null}return null},e.hasVerifiedEmail=function(){var e=i();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3?t.emailverified:null}return null},e.proDate=function(){var e=i();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3?new Date(t.prodate):null}return null},e.isPro=function(){var e=i();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3?t.pro:null}return null};var i=function(){return getCookie("auth")};return getCookie=function(e){for(var t=e+"=",n=document.cookie.split(";"),i=0;i<n.length;i++){for(var a=n[i];" "==a.charAt(0);)a=a.substring(1);if(0==a.indexOf(t))return a.substring(t.length,a.length)}return null},e}();$(function(){$("#btn_register").click(auth.register),$("#btn_login").click(auth.login),$("#login-modal input[type=password]").keyup(function(e){13==e.keyCode&&auth.login()}),$("#btn_newPassword").click(function(e){var t=$("#new-password__password").val();t&&auth.updatePassword(t,function(){$.closeModal(),$.createToast("Your password has been updated")})}),$("#btn_verifyPass").click(function(e){var t=$("#forgot__email-address").val();t&&auth.forgotPassword(t,function(){$.closeModal(),$.createToast("A password reset link has been sent to you")})}),$("#btn_newPassword").click(function(e){var t=$("#new-password__password").val();t&&auth.updatePassword(t,function(){$.closeModal(),$.createToast("Your password has been updated")})})}),jQuery.fn.extend({addError:function(e,t){var n=e||"This field is invalid";return this.each(function(){t=t||"",t.length&&(t=" "+t),$(this).next(".error").remove(),$(this).after("<div class='error"+t+"'>"+n+"</div>")})},removeError:function(){return this.each(function(){$(this).next(".error").remove()})},isTextField:function(){return $(this).first().is("input[type=text], input[type=email], input[type=password], textarea")},toggleText:function(e,t){return this.each(function(){var n=$(this).text();n===e?$(this).text(t):n===t&&$(this).text(e)})},hasError:function(){return $(this).first().next().hasClass("error")},requirify:function(e){var t=e||"This is a required field",n=!0;return this.each(function(){return 0===$(this).val().length?($(this).addError(t),n=!1,!1):void $(this).removeError()}),n},requirifyCheck:function(e){var t=e||"This is a required field",n=!0;return this.each(function(){return $(this).is(":checked")?void $(this).removeError():($(this).addError(t),n=!1,!1)}),n},emailify:function(e){function t(e){var t=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;return t.test(e)}var n=e||"Please enter a valid email address";return t($(this).val())?($(this).removeError(),!0):($(this).addError(n),!1)},footerify:function(e){if(!e.bodyWrapper||!e.footer)return!1;var t=e.bodyWrapper,n=e.footer,i=$("footer").outerHeight();$(".body-wrapper").css("min-height","100%").css("margin-bottom","-"+i+"px")},showPasswordify:function(e){return this.each(function(){if("undefined"==typeof e.control)return!1;var t=$(this),n=e.control,i=e.showText||"Show",a=e.hideText||"Hide";n.click(function(){"text"===t.prop("type")?(t.prop("type","password"),n.text(i)):"password"===t.prop("type")&&(t.prop("type","text"),n.text(a))})})},simpleEditify:function(e){var t=$.extend({onOpen:function(){},onClose:function(){},onSaveSuccess:function(){}},e);return this.each(function(){function n(e){var n=e.find("input");n.data("initial-value",n.val()).removeAttr("disabled").focus(),e.find(".simple-edit__edit").toggleText("Edit","Save").toggleClass("btn--blue btn--green simple-edit__edit simple-edit__save"),t.onOpen()}function i(e){var n=e.find("input"),i=n.data("initial-value");n.val(i),n.prop("disabled",!0),e.find(".simple-edit__save").toggleText("Edit","Save").toggleClass("btn--blue btn--green simple-edit__edit simple-edit__save"),t.onClose()}function a(e){return!e.hasError()&&(e.find("input").prop("disabled",!0),e.find(".simple-edit__save").toggleText("Edit","Save").toggleClass("btn--blue btn--green simple-edit__edit simple-edit__save"),t.onClose(),void t.onSaveSuccess())}$(this).on("click",".simple-edit__edit",function(){var e=$(this).closest(".simple-edit");n(e)}),$(this).on("keyup",".simple-edit__input",function(e){if(27===e.which){var t=$(this).closest(".simple-edit");i(t)}}),$(this).on("keydown",".simple-edit__input",function(e){if(13===e.which&&e.metaKey){var t=$(this).closest(".simple-edit");a(t)}}),$(this).on("click",".simple-edit__save",function(){if(0===$(this).find(".error").length){var t=$(this).closest(".simple-edit"),n=function(){a(t)};e.onSave?e.onSave(n):n()}})})}}),$.createToast=function(e,t,n){function i(e){return window.getComputedStyle(e[0]).opacity}var a=t||3e3;n=n||"",$("body").append("<div class='toast "+n+"'>"+e+"</div>");var o=$(".toast");i(o),o.addClass("appear"),setTimeout(function(){o.removeClass("appear").on("transitionend",function(){$(this).remove()})},a)},$(document).ready(function(){$("a[href=#]").click(function(e){e.preventDefault()}),$(document).on("click","a[data-modal]",function(e){window.lifetime=!1,$(this).is("[lifetime]")&&(window.lifetime=!0),$(this).closest(".line").length>0&&(window.editid=$(this).closest(".line").attr("name"));var t=$(this).attr("data-modal");$.openModal(t)}),$.openModal=function(e){if($("body").hasClass("has-modal-open")&&$.closeModal(),auth&&auth.isLoggedIn()&&"signup-modal"===e)auth.isPro()?console.error("already pro"):stripe.launch();else{var t=$(".modal").filter("#"+e);t.addClass("is-visible"),$("body").addClass("has-modal-open")}},$(".modal a.modal__close").click(function(){$.closeModal()}),$(".modal").click(function(e){$(e.toElement).is(".modal:not(.modal--uncloseable)")&&$.closeModal()}),$(document).keyup(function(e){27===e.keyCode&&$("body").hasClass("has-modal-open")&&$.closeModal()}),$.closeModal=function(){$(".modal.is-visible").removeClass("is-visible"),$("body").removeClass("has-modal-open")}}),function(e,t,n,i,a,o,s){e.GoogleAnalyticsObject=a,e[a]=e[a]||function(){(e[a].q=e[a].q||[]).push(arguments)},e[a].l=1*new Date,o=t.createElement(n),s=t.getElementsByTagName(n)[0],o.async=1,o.src=i,s.parentNode.insertBefore(o,s)}(window,document,"script","https://www.google-analytics.com/analytics.js","ga"),ga("create","UA-77534503-1","auto"),ga("send","pageview"),$(document).ready(function(){function e(){var e=$("section.submit textarea"),t=e.attr("maxlength"),n=e.val().length,i=t-n,a=i<1;$("section.submit .char-remaining").text(i),$("section.submit label[for=the-line] .form-control__label-hint").toggleClass("error",a)}function t(e){for(var t=window.location.search.substring(1),n=t.split("&"),i=0;i<n.length;i++){var a=n[i].split("=");if(a[0]===e)return a[1]}return!1}function n(e){$.getJSON("app/data/"+Z+"/"+R,function(t){K=t,e()})}function i(e,t){$.post("app/add",e).done(function(){$("body").toggleClass("is-unverified-email",!1),t()}).error(function(e){403===e.status&&$.createToast(e.responseJSON.message),401===e.status&&$("body").toggleClass("is-unverified-email",!auth.hasVerifiedEmail())})}function a(e,t,n){$.getJSON("app/rate/"+e+"/"+t,function(){n()})}function o(e,t){$.get("admin/"+e+"/delete").then(function(){t()})}function s(e,t,n){$.post("admin/"+e+"/updatetext",t).then(function(){n()})}function r(e){$.get("auth/verifyemail").then(function(){e()})}function l(e){var t=$("section."+e);t.hasClass("active")||($("section.active").removeClass("active"),t.addClass("active"))}function c(){var e=$("section.submit");e.find("input, textarea").removeAttr("disabled"),e.find(".btn--green").removeAttr("disabled"),e.find(".switch").removeClass("disabled")}function d(){var e=$("section.submit");e.find("input, textarea").attr("disabled",!0),e.find(".btn--green").attr("disabled",!0),e.find(".switch").addClass("disabled")}function u(e){var t={};t.line=$("#the-line").val(),t.men=$("#audience-men").is(":checked"),t.women=$("#audience-women").is(":checked"),t.kids=$("#audience-kids").is(":checked"),t.couples=$("#audience-couples").is(":checked"),t.groups=$("#audience-groups").is(":checked"),t.profanity=$("#switch-pg").hasClass("active"),i(t,e)}function f(){$("#the-line").val(""),p($("body"))}function p(e){$("html, body").animate({scrollTop:e.offset().top},250)}function h(){window.editid&&o(window.editid,function(){$.closeModal()})}function m(){v(),g(),P(),M()}function v(){var e;Z===j.MEN&&(e="men"),Z===j.WOMEN&&(e="women"),Z===j.KIDS&&(e="kids"),Z===j.COUPLES&&(e="couples"),Z===j.GROUPS&&(e="groups"),$("span.audience").text(e)}function g(){var e=w();S(e)}function w(){for(var e=b()?1:5,t=[],n=[],i=!1,a=$("main .line").first(),o=0;o<e&&o<K.length;o++){for(var s;;)if(s=_(),y(s._id,n)){n.push(s._id),t.push(s);break}if(0===a.length&&(a=x()),k(s,a),i=C(a))break;a=a.next(),$(".btn_admin_save").click(handleUpdateText)}return t}function b(){return window.matchMedia("(max-width: 568px)").matches}function _(){var e=Math.floor(Math.random()*K.length);return K[e]}function y(e,t){return t.indexOf(e)===-1}function x(){return $("#lines .line:last-child").clone().appendTo("#lines")}function k(e,t){t.find(".line__text").html(e.line),t.find(".line__byline .author").text(e.author),t.attr("name",e._id)}function C(e){return!!E(e)&&(b()?T(e):e.remove(),!0)}function E(e){var t=e[0].getBoundingClientRect(),n=$(".lines__footer").height()+$("#progress-bar").height(),i=window.innerHeight-n;return t.bottom>i}function T(e){for(var t=e.children(".line__text").css("font-size"),n=parseInt(t,10);E(e);)n-=2,e.children(".line__text").css("font-size",n)}function S(e){te=e.map(function(e){return e.line.length}).reduce(function(e,t){return e+t})}function P(){Q=$("input[type=range]").val()}function M(){X=requestAnimationFrame(N)}function O(){cancelAnimationFrame(X),ee=null}function A(){O(),ee=null,V.width(0)}function N(e){var t=D(e);t>100&&(t=0,q());var n=t+"%";V.css("width",n),ee=e,M()}function D(e){ee||(ee=e);var t=e-ee,n=V.width()/G.width()*100,i=b()?.5:1,a=i*Q*t/te;return n+a}function q(){I(),L(),g(),p($("body"))}function I(){$(".thumbs-up.active, .thumbs-down.active").removeClass("active")}function L(){$("#lines .line__text").removeAttr("style")}function J(e){if(!auth.isAdmin())return!1;var t=!!ee,n=$(".line__textarea");n.length&&z(),B(),F=e.html();var i=e.outerHeight();e.replaceWith("<textarea class='line__textarea' spellcheck='true' style='height: "+i+"px;'>"+F+"</textarea>"),$(".line__textarea").data("prog-bar-running",t).focus()}function U(){W();var e=$(".line__textarea");e.replaceWith("<p class='line__text'>"+e.val()+"</p>"),$.createToast("Changes saved!")}function W(){var e=$(".line__textarea").data("prog-bar-running");e&&H()}function z(){W(),$(".line__textarea").replaceWith("<p class='line__text'>"+F+"</p>")}function Y(){A(),V.width(0),q(),$(".pause").hasClass("is-paused")||M()}function B(){$(".pause").addClass("is-paused"),O()}function H(){$(".pause").removeClass("is-paused"),M()}var K=[],R=!1,j={MEN:0,WOMEN:1,KIDS:2,COUPLES:3,GROUPS:4},F,G=$("#progress-bar"),V=$("#progress-bar__fill"),Z,Q,X,ee,te;e(),"true"===t("enter-new-password")&&($("#new-password-modal").addClass("is-visible"),$("body").addClass("has-modal-open"),$("#new-password__password").showPasswordify({control:$("#new-password-modal .show-password")})),"true"===t("email-verified")&&$.createToast("Your email has been verified!  Thanks!"),$("a.begin-session").click(function(){Z=Number($(this).attr("data-audience-type")),n(function(){l("lines"),m()})}),$(".switch").click(function(){$(this).toggleClass("active");var e=$(".begin-session[data-audience-type=2]");R=$(this).hasClass("active"),e.toggleClass("disabled",R)}),$(".btn.add-line").click(function(){l("submit"),auth.isLoggedIn()?c():d()}),$("#email_verify").html('You must verify your email address to submit a new line.  <a id="send_verify_email" href="#" class="resend-verification-email">Send verification email to '+auth.loggedInEmail()+'</a> or <a href="my-account">change email address</a>.'),$("section.submit a.close").click(function(){l("splash")}),$("section.submit textarea").keyup(function(){e()}),$("section.submit .add-line").click(function(){$(".error").remove();var e=" <span class='error'>Required</span>";if(""===$("#the-line").val()&&$("label[for=the-line]").append(e),0===$(".checkbox-list input:checked").length&&$(".form-control--audience .form-control__label").append(e),0===$(".error").length)u(function(){$.createToast("Line submitted!"),f()});else{var t=$(".error").first();p(t)}}),$("#delete").click(h),handleUpdateText=function(e){var t=$(this).closest(".line").attr("name"),n=$(this).closest(".line").find(".line__textarea").val();s(t,{text:n},function(){$.closeModal()})};var ne=function(){r(function(){$.createToast("Verification email sent!")})};$("#send_verify_email").click(ne),$(document).on("click",".line__text",function(){J($(this))}),$("body").toggleClass("is-admin",auth.isAdmin()),$("body").toggleClass("is-logged-in",auth.isLoggedIn()),$("body").toggleClass("is-trial",!auth.isLoggedIn()),$("body").toggleClass("is-pro",auth.isPro()),$("body").toggleClass("is-not-pro",!auth.isPro()),$("body").toggleClass("is-cancelled",!auth.isPro()&&auth.isLoggedIn()),$("body").toggleClass("is-monthly",auth.isMonthly()),$(document).on("click",".line__delete",function(){var e=$(this).closest(".line").attr("name");$("#delete-line-modal").data("line",e),B()}),$("#delete-line-modal, #delete-line-modal .modal__close, #delete-line-modal .btn--red").click(function(){H()}),$("#delete-line-modal .btn--red").click(function(){var e=$("#delete-line-modal").data("line");$.createToast("Line deleted",null,"toast--red"),$(".line[name="+e+"]").remove()}),$(document).on("keydown",".line__textarea",function(e){13===e.which&&e.metaKey&&U()}),$(document).on("click",".line__save-change",function(){U()}),$(document).on("keydown",".line__textarea",function(e){27===e.which&&z()}),$(document).on("click",".line__cancel-change",function(){z()}),$(window).on("swipeleft",function(){Y()}),$("section.lines a.close").click(function(){l("splash"),A(),$(".pause").removeClass("is-paused")}),$(document).on("click",".thumbs-up, .thumbs-down",function(){var e=$(this).parents(".line").attr("name"),t=$(this).hasClass("thumbs-up"),n=$(this);a(e,t,function(){n.toggleClass("active"),n.hasClass("active")&&n.siblings(".btn.active").removeClass("active")})}),$("input[type=range]").change(function(){Q=$(this).val()}),$(".pause").click(function(){$(this).hasClass("is-paused")?H():B()}),$(".next").click(function(){Y()})}),$("#admin-table .btn:first-child").click(function(){$(this).toggleClass("active"),$(this).hasClass("active")?$(this).text("Approved"):$(this).text("Approve")}),$("#admin-table .btn:last-child").click(function(){window.confirm("Delete this line?  This cannot be undone.")}),$("#admin-table .ban-ip").click(function(){window.confirm("Ban this IP?  This will also delete all this IP's lines, and cannot be undone.")});
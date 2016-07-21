var configuration=function(){var e={stripe_pk:"pk_test_p43Roytjpdw7yHKTMppmOy2k"};return e}();$(document).ready(function(){function e(e){for(var t=e+"=",n=document.cookie.split(";"),i=0;i<n.length;i++){for(var o=n[i];" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return null}var t=function(){return $("#signup-modal input[type=email]").emailify()&&$("#signup-modal input[required]").requirify()},n=function(e){if(e.preventDefault(),t()){var n={};n.email=$("#email").val(),n.password=$("#password").val(),n.name=$("#name").val(),$.post("auth/register",n).done(function(e){$("#btn_register").hide(),$("#btn_checkout").show()}).error(function(e){$("#signup-modal input[type=email]").addError("This email has already been taken.  <a href='#' data-modal='login-modal'>Login</a> if it's yours")})}};$("#btn_register").click(n);var i=function(){return $("#login-modal input[type=email]").emailify()&&$("#login-modal input[required]").requirify()},o=function(){if(i){var e={};e.email=$("#login__email-address").val().toLowerCase(),e.password=$("#login__password").val(),$.post("auth/login",e).done(function(e){document.location.href="/app"}).error(function(e){$("#login-modal input[type=email]").addError("Email or password incorrect")})}};$("#btn_login").click(o);var a=function(){$.post("auth/logout").done(function(){document.location.href="/"})};$("#logout").click(a),cancel=function(){$.post("auth/cancel").done(function(){document.location.href="/my-account"})},$("#cancel").click(cancel),updateEmailAddress=function(e,t){$.post("auth/email",{email:e}).done(function(){t()})},updatePassword=function(e,t){$.post("auth/password",{password:e}).done(function(){t()})},isLoggedIn=function(){var e=r();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3}return!1},isAdmin=function(){var e=r();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3&&t.admin}return!1},isMonthly=function(){var e=r();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3&&"monthly"===t.type}return!1},isLifeTime=function(){var e=r();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3&&"lifetime"===t.type}return!1},loggedInEmail=function(){var e=r();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3?t.email:null}return null},hasVerifiedEmail=function(){var e=r();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3?t.emailverified:null}return null},proDate=function(){var e=r();if(e){var t=JSON.parse(window.atob(e.split(".")[1]));return t.exp>Date.now()/1e3?new Date(t.prodate):null}return null};var r=function(){return e("auth")}}),jQuery.fn.extend({addError:function(e,t){var n=e||"This field is invalid";return this.each(function(){t=t||"",t.length&&(t=" "+t),$(this).next(".error").remove(),$(this).after("<div class='error"+t+"'>"+n+"</div>")})},removeError:function(){return this.each(function(){$(this).next(".error").remove()})},isTextField:function(){return $(this).first().is("input[type=text], input[type=email], input[type=password], textarea")},toggleText:function(e,t){return this.each(function(){var n=$(this).text();n===e?$(this).text(t):n===t&&$(this).text(e)})},hasError:function(){return $(this).first().next().hasClass("error")},requirify:function(e){var t=e||"This is a required field",n=!0;return this.each(function(){return 0===$(this).val().length?($(this).addError(t),n=!1,!1):void $(this).removeError()}),n},emailify:function(e){function t(e){var t=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;return t.test(e)}var n=e||"Please enter a valid email address";return t($(this).val())?($(this).removeError(),!0):($(this).addError(n),!1)},showPasswordify:function(e){return this.each(function(){if("undefined"==typeof e.control)return!1;var t=$(this),n=e.control;n.click(function(){"text"===t.prop("type")?t.prop("type","password"):"password"===t.prop("type")&&t.prop("type","text")})})},simpleEditify:function(e){var t=$.extend({onOpen:function(){},onClose:function(){},onSaveSuccess:function(){}},e);return this.each(function(){function n(e){var n=e.find("input");n.data("initial-value",n.val()).removeAttr("disabled").focus(),e.find(".simple-edit__edit").toggleText("Edit","Save").toggleClass("btn--blue btn--green simple-edit__edit simple-edit__save"),t.onOpen()}function i(e){var n=e.find("input"),i=n.data("initial-value");n.val(i),n.prop("disabled",!0),e.find(".simple-edit__save").toggleText("Edit","Save").toggleClass("btn--blue btn--green simple-edit__edit simple-edit__save"),t.onClose()}function o(e){return e.hasError()?!1:(e.find("input").prop("disabled",!0),e.find(".simple-edit__save").toggleText("Edit","Save").toggleClass("btn--blue btn--green simple-edit__edit simple-edit__save"),t.onClose(),void t.onSaveSuccess())}$(this).on("click",".simple-edit__edit",function(){var e=$(this).closest(".simple-edit");n(e)}),$(this).on("keyup",".simple-edit__input",function(e){if(27===e.which){var t=$(this).closest(".simple-edit");i(t)}}),$(this).on("keydown",".simple-edit__input",function(e){if(13===e.which&&e.metaKey){var t=$(this).closest(".simple-edit");o(t)}}),$(this).on("click",".simple-edit__save",function(){if(0===$(this).find(".error").length){var t=$(this).closest(".simple-edit"),n=function(){o(t)};e.onSave?e.onSave(n):n()}})})}}),$.createToast=function(e,t,n){function i(e){return window.getComputedStyle(e[0]).opacity}var o=t||3e3,n=n||"";$("body").append("<div class='toast "+n+"'>"+e+"</div>");var a=$(".toast");i(a),a.addClass("appear"),setTimeout(function(){a.removeClass("appear").on("transitionend",function(){$(this).remove()})},o)},$(document).ready(function(){$("a[href=#]").click(function(e){e.preventDefault()}),$(document).on("click","a[data-modal]",function(){window.lifetime=!1,$(this).is("[lifetime]")&&(window.lifetime=!0),$(this).closest(".line").length>0&&(window.editid=$(this).closest(".line").attr("name")),$("body").hasClass("has-modal-open")&&$.closeModal();var e=$(this).attr("data-modal"),t=$(".modal").filter("#"+e);t.addClass("is-visible"),$("body").addClass("has-modal-open")}),$(".modal a.modal__close").click(function(){$.closeModal()}),$(".modal").click(function(e){$(e.toElement).is(".modal")&&$.closeModal()}),$(document).keyup(function(e){27===e.keyCode&&$("body").hasClass("has-modal-open")&&$.closeModal()}),$.closeModal=function(){$(".modal.is-visible").removeClass("is-visible"),$("body").removeClass("has-modal-open")}}),function(e,t,n,i,o,a,r){e.GoogleAnalyticsObject=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=1*new Date,a=t.createElement(n),r=t.getElementsByTagName(n)[0],a.async=1,a.src=i,r.parentNode.insertBefore(a,r)}(window,document,"script","https://www.google-analytics.com/analytics.js","ga"),ga("create","UA-77534503-1","auto"),ga("send","pageview");var stripe=function(){var e={};return e.handler=StripeCheckout.configure({key:configuration.stripe_pk,image:"images/apple-touch-icon-120.png",locale:"auto",zipCode:!0,token:function(e){console.log("have the token"),window.lifetime?$.post("auth/lifetime",{token:e.id}).done(function(e){console.log("redirecting"),document.location.href="/app"}):$.post("auth/monthly",{token:e.id}).done(function(e){console.log("redirecting"),document.location.href="/app"})}}),e.launch=function(t){t.preventDefault(),$.closeModal(),window.lifetime?e.launchlifetime(loggedInEmail()):e.launchmonthly(loggedInEmail())},$(function(){$("#btn_checkout").click(e.launch)}),e.launchlifetime=function(t){console.log("button clicked"),e.handler.open({name:"Hurleyisms",description:"Lifetime Access",amount:9900,zipCode:!0,email:t})},e.launchmonthly=function(t){e.handler.open({name:"Hurleyisms",description:"Monthly Subscription",amount:499,zipCode:!0,email:t})},$(window).on("popstate",function(){e.handler.close()}),e}();$(document).ready(function(){$("input[type=password]").showPasswordify({control:$(".show-password")}),$(".show-password").click(function(){$(this).toggleText("Show","Hide")})});
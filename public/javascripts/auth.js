$(document).ready(function () {
    var validateRegisterForm = function () {
         //$("input[type=email]").uniquify("This email has already been taken.  <a href='#' data-modal='login-modal'>Login</a> if it's yours") &&
        return $("#signup-modal input[type=email]").emailify() &&
            $("#signup-modal input[required]").requirify();


    }
    var register = function (e) {
        e.preventDefault();
        if (validateRegisterForm()) {
            var user = {};
            user.email = $("#email").val();
            user.password = $("#password").val();
            user.name = $("#name").val();
            $.post('auth/register', user, function (data) {
                $.closeModal();
                if (window.lifetime) {
                    launchlifetime(user.email);
                }
                else  {
                    launchmonthly(user.email);
                }
            });
        }
    }
    $("#btn_register").click(register);

    

    isLoggedIn = function () {
        var token = getToken();
        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    var getToken = function () {
        return getCookie("auth");
    };

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }
});
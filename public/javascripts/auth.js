var auth = function () {
    var auth = {};
    var validateRegisterForm = function () {
        var fields =  $("#signup-modal input[type=email]").emailify() &&
            $("#signup-modal input[required]").requirify(); 

        var terms = $("#chk_terms").requirifyCheck("You must accept the terms and privacy policy");
        return terms && fields;
    };
    auth.register = function (e) {
        e.preventDefault();
        //this line isn't needed as validate will remove all users
        //$("#signup-modal input[required]").removeError();
        if (validateRegisterForm()) {
            var user = {};
            user.email = $("#email").val();
            user.password = $("#password").val();
            user.name = $("#name").val();
            var coupon = $("#coupon-code").val();
            if(coupon) user.coupon = coupon;
            $.post('auth/register', user)
                .done(function (data) {
                    //TODO Andrew, distinguish this flow for mobile vs. non-mobile users
                    $.openModal("checkout-modal");
                })
                .error(function (error) {
                    $("#signup-modal input[type=email]").addError("This email has already been taken.  <a href='#' data-modal='login-modal'>Login</a> if it's yours");
                });
        }
    };
    var validateLogInForm = function () {
        return $("#login-modal input[type=email]").emailify() &&
            $("#login-modal input[required]").requirify();
    };
    auth.login = function () {
        if (validateLogInForm) {
            var user = {};
            user.email = $("#login__email-address").val().toLowerCase();
            user.password = $("#login__password").val();
            $.post('auth/login', user).done(function (data) {
                document.location.href = '/app';
            }).error(function (error) {
                $("#login-modal input[type=email]").addError("Email or password incorrect");
            });
        }
    };
    
    auth.logout = function () {
        $.post('auth/logout').done(function () {
            document.location.href = '/';
        });
    };


    auth.cancel = function (callback) {
        $.post('auth/cancel').done(function () {
            //document.location.href = '/my-account';
            if (callback) callback();
        });
    };
    auth.updateEmailAddress = function (email, callback) {
        $.post('auth/email', { email: email }).done(function () {
            callback();
        });
    };
    auth.updatePassword = function (password, callback) {
        $.post('auth/password', { password: password }).done(function () {
            if (callback) callback();
        });
    };
    auth.forgotPassword = function (email, callback) {
        $.post('auth/forgotPassword', { email: email }).done(function () {
            if (callback) callback();
        });
    };
    
    auth.isLoggedIn = function () {
        var token = getToken();
        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.isAdmin = function () {
        var token = getToken();
        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000 && payload.admin;
        } else {
            return false;
        }
    };

    auth.isMonthly = function () {
        var token = getToken();
        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000 && payload.type === "monthly";
        } else {
            return false;
        }
    };

    auth.isLifeTime = function () {
        var token = getToken();
        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000 && payload.type === "lifetime";
        } else {
            return false;
        }
    };

    auth.loggedInEmail = function () {
        var token = getToken();
        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            if (payload.exp > Date.now() / 1000) return payload.email;
            return null;
        } else {
            return null;
        }
    };

    auth.hasVerifiedEmail = function () {
        var token = getToken();
        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            if (payload.exp > Date.now() / 1000) return payload.emailverified;
            return null;
        } else {
            return null;
        }
    };

    auth.proDate = function () {
        var token = getToken();
        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            if (payload.exp > Date.now() / 1000) return new Date(payload.prodate);
            return null;
        } else {
            return null;
        }
    };

    auth.isPro = function () {
        var token = getToken();
        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            if (payload.exp > Date.now() / 1000) return payload.pro;
            return null;
        } else {
            return null;
        }
    };


    var getToken = function () {
        return getCookie("auth");
    };

    getCookie = function (cname) {
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
    };
    return auth;
}();
$(function() {
    $("#btn_register").click(auth.register);
    $("#btn_login").click(auth.login);
    $("#login-modal input[type=password]").keyup(function(e){
        if(e.keyCode == 13)
        {
            auth.login();
        }
    });
    $("#btn_newPassword").click(function (e) {
        var newPassword = $("#new-password__password").val();
        if (newPassword) {
            auth.updatePassword(newPassword, function () {
                $.closeModal();
                $.createToast("Your password has been updated");
            });
        }
    });
    $("#btn_verifyPass").click(function (e) {
        var emailAddress = $("#forgot__email-address").val();
        if (emailAddress) {
            auth.forgotPassword(emailAddress,function(){
                $.closeModal();
                $.createToast("A password reset link has been sent to you");
            });
        }
    });
    $("#btn_newPassword").click(function (e) {
        var newPassword = $("#new-password__password").val();
        if (newPassword) {
            auth.updatePassword(newPassword, function () {
                $.closeModal();
                $.createToast("Your password has been updated");
            });
        }
    });
});
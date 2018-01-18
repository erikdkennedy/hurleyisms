$(document).ready(function () {

    /*****************************************
				  INITIALIZATION
	*****************************************/

    $("body").footerify({
        bodyWrapper: $(".body-wrapper"),
        footer: $("footer")
    });

    $("input[type=email]").val(auth.loggedInEmail());
    $("input[type=email], input[type=password]").requirify();
    $("input[type=email]").emailify();
    $("input[type=password]").showPasswordify({
        control: $(".show-password")
    });

    $("#email").simpleEditify({
        onSaveSuccess: function () {
            $.createToast("New email address saved!  Check your inbox for Hurleyisms's message to confirm this email is yours.");
        },
        onSave: function (callback) {
            var email = $("input[type=email]").val();
            auth.updateEmailAddress(email, callback);
        }
    });

    $("#password").simpleEditify({
        onOpen: function () {
            $("input[type=password]").val("");
            $(".show-password").removeClass("hidden");
        },
        onClose: function () {
            $("input[type=password]").val("password");
            $(".show-password").addClass("hidden");
        },
        onSaveSuccess: function () {
            $.createToast("New password saved!");
        },
        onSave: function (callback) {
            if ($("input[type=password]").requirify()) {
                var password = $("input[type=password]").val();
                auth.updatePassword(password, callback);
            }
        }
    });

    /*****************************************
					LISTENERS
	*****************************************/

    //TODO Andrew remove
    $(document).keyup(function (e) {
        if (e.which === 84) $("body").toggleClass("is-monthly is-lifetime");
    });

    //click "Show/hide password"
    $(".show-password").click(function () {
        $(this).toggleText("Show password", "Hide password");
    });
            $("#lifetime").hide();
            $("#monthly").hide();
            $("#vip").hide();
            $("#basic").hide();
            $("#cancle").hide();
    //console.log(auth.type() + " type");
    switch(auth.type())
    {
        case "monthly":
            $("#monthly").show();
            $("#cancle").show();
            $("body").toggleClass("is-monthly", true);
            $("body").toggleClass("is-lifetime",false);
            break;
        case "lifetime":
            $("#lifetime").show();
            $("body").toggleClass("is-lifetime",true);
             $("body").toggleClass("is-monthly", false);
            break;
        case "vip":
            $("#vip").show();
            break;
        default:
            $("#basic").show();
    }
    var setPage = function () {
        //$("body").toggleClass("is-monthly", auth.isMonthly());
        //$("body").toggleClass("is-lifetime", auth.isLifeTime());
        $("#coupon-code").val(auth.coupon())
        $("#btn_checkout").click(function(){
            window.lifetime = true;
            stripe.launch()});
        if (auth.isLifeTime() || auth.isMonthly()) {
            $(".if-purgatory").hide();
        } else {
            $("#lifetime").hide();
            $("#monthly").hide();
            $("#cancle").hide();
            $(".if-purgatory").toggleClass("if-purgatory");
        }
    }
    setPage();
    var mthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var pdate = auth.proDate();
    //console.log("prodate: "+pdate);
    if (pdate) {
        //console.log("have pdate");
        $(".started").html("Started " + mthNames[pdate.getMonth()] + " " + pdate.getFullYear());
        $(".ending").html("Ending " + mthNames[pdate.getMonth()] + " " + (1 + pdate.getFullYear()));
    }
    $("#logout").click(auth.logout);
    $("#cancel").click(function () {
        auth.cancel(function () {
            $.closeModal();
            setPage();
            $.createToast("Your monthly subscriptions has been cancled", 10000);
        });
    });

    $(".privacy").click(function () {
        window.open("/privacy")
    });
    $(".terms").click(function () {
        window.open("/terms")
    });
});
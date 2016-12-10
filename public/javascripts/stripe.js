var stripe = function () {
    var stripe = {};
    stripe.handler = StripeCheckout.configure({
        key: configuration.stripe_pk,
        image: 'images/apple-touch-icon-120.png',
        locale: 'auto',
        zipCode: true,
        token: function (token) {
            // You can access the token ID with `token.id`.
            // Get the token ID to your server-side code for use.
            var postUrl = window.lifetime ? "auth/lifetime" : "auth/monthly";

            $.post(postUrl, {
                token: token.id
            }).done(function (data) {
                $.createToast("Thanks for joining Hurleyisms Pro.  We're redirecting you <a href='app'>back to the app</a> in a few seconds", 5000);

                console.log('redirecting');
                setTimeout(function () {
                    document.location.href = '/app';
                }, 5000);
            }).
            error(function (error) {
                $.createToast("There was a problem processing your card. Please <a href='javascript:stripe.launch()'>try again</a>", 10000);
            });
        }
    });
    var convertAmountForCoupon = function (amount, coupon) {
        if (!coupon) return amount;
        if (coupon.percent_off && coupon.percent_off != null) {
            var newAmount = (amount * (100 - coupon.percent_off)) / 100;
            if (newAmount >= 0) return newAmount;
        }
        if (coupon.amount_off && coupon.amount_off != null) {
            var newAmount = amount - coupon.amount_off;
            if (newAmount >= 0) return newAmount;
        }

        return amount;
    }
    stripe.launch = function (e) {
        if (e) e.preventDefault();
        $.closeModal();
        if (window.lifetime) {
            stripe.launchlifetime(auth.loggedInEmail());
        } else {
            stripe.launchmonthly(auth.loggedInEmail());
        }
    };
    stripe.launchlifetime = function (email) {
        var total = 9900
        var coupon = auth.coupon();
        if (coupon) {
            total = convertAmountForCoupon(total, window.coupon)
        }
        // Open Checkout with further options:
        stripe.handler.open({
            name: 'Hurleyisms',
            description: 'Lifetime Access',
            amount: total,
            zipCode: true,
            email: email
        });
    };
    stripe.launchmonthly = function (email) {
        var total = 499
        var coupon = auth.coupon();
        if (coupon) {
            total = convertAmountForCoupon(total, window.coupon)
        }
        stripe.handler.open({
            name: 'Hurleyisms',
            description: 'Monthly Subscription',
            amount: total,
            zipCode: true,
            email: email
        });
    };
    // Close Checkout on page navigation:
    $(window).on('popstate', function () {
        stripe.handler.close();
    });
    $("#btn_checkout").click(stripe.launch);
    return stripe;
}();
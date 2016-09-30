var stripe = function() {
    var stripe = {};
    stripe.handler = StripeCheckout.configure({
        key: configuration.stripe_pk,
        image: 'images/apple-touch-icon-120.png',
        locale: 'auto',
        zipCode: true,
        token: function(token) {
            // You can access the token ID with `token.id`.
            // Get the token ID to your server-side code for use.
            var postUrl = window.lifetime ? "auth/lifetime" : "auth/monthly";

            $.post(postUrl, {
                    token: token.id
                })
                .done(function(data) {
                    $.createToast("Thanks for joining Hurleyisms Pro.  We're redirecting you <a href='app'>back to the app</a> in a few seconds", 5000);

                    console.log('redirecting');
                    setTimeout(function() {
                        document.location.href = '/app';
                    }, 5000);
                }).
            error(function(error) {

                $.createToast("There was a problem processing your card. Please <a href='javascript:stripe.launch()'>try again</a>", 10000);

            });

        }
    });
    var validateAmount = function(amount, callback) {
        $.get('auth/amount/' + amount)
            .done(function(data) {
                if (!data.amount) {
                    console.error("did not get amount back");
                }
                callback(parseInt(data.amount));
            });
    }
    stripe.launch = function(e) {
        if (e) e.preventDefault();
        $.closeModal();
        if (window.lifetime) {
            stripe.launchlifetime(auth.loggedInEmail());
        } else {
            stripe.launchmonthly(auth.loggedInEmail());
        }
    };
    stripe.launchlifetime = function(email) {
        var total = 9900
        validateAmount(total, function(tot) {
            // Open Checkout with further options:
            stripe.handler.open({
                name: 'Hurleyisms',
                description: 'Lifetime Access',
                amount: tot,
                zipCode: true,
                email: email
            });
        });
    };
    stripe.launchmonthly = function(email) {
        var total = 499
        validateAmount(total, function(tot) {
            stripe.handler.open({
                name: 'Hurleyisms',
                description: 'Monthly Subscription',
                amount: tot,
                zipCode: true,
                email: email
            });
        });
    };

    // Close Checkout on page navigation:
    $(window).on('popstate', function() {
        stripe.handler.close();
    });
    return stripe;
}();
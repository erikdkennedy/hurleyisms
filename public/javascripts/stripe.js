var stripe = function () {
    var stripe = {};
    stripe.handler = StripeCheckout.configure({
        key: configuration.stripe_pk,
        image: 'images/apple-touch-icon-120.png',
        locale: 'auto',
        zipCode: true,
        token: function (token) {
            console.log("have the token");
            // You can access the token ID with `token.id`.
            // Get the token ID to your server-side code for use.
            if (window.lifetime) {
                $.post('auth/lifetime', { token: token.id }).done(function (data) {
                    console.log('redirecting');
                    document.location.href = '/app';
                });
            }
            else {
                $.post('auth/monthly', { token: token.id }).done(function (data) {
                    console.log('redirecting');
                    document.location.href = '/app';
                });
            }
        }
    });
    stripe.launch = function (e) {
        e.preventDefault();
        $.closeModal();
        if (window.lifetime) {
            stripe.launchlifetime(window.email);
        }
        else {
            stripe.launchmonthly(window.email);
        }
    };
    stripe.launchlifetime = function (email) {
        // Open Checkout with further options:
        console.log("button clicked");
        stripe.handler.open({
            name: 'Hurleyisms',
            description: 'Lifetime Access',
            amount: 9900,
            zipCode: true,
            email: email
        });

    }
    stripe.launchmonthly = function (email) {
        stripe.handler.open({
            name: 'Hurleyisms',
            description: 'Monthly Subscription',
            amount: 499,
            zipCode: true,
            email: email
        });
    }

    // Close Checkout on page navigation:
    $(window).on('popstate', function () {
        stripe.handler.close();
    });
    return stripe
}();
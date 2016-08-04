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
            
                $.post(postUrl, { token: token.id })
                .done(function (data) {
                    $.createToast("Thanks for joining Hurleyisms Pro.  We're redirecting you <a href='app'>back to the app</a> in a few seconds", 5000);

                    console.log('redirecting');
                    setTimeout(function() {
                        document.location.href = '/app';
                    }, 5000);
                }).
                error(function(error){
                   
                      $.createToast("There was a problem processing your card. Please <a href='javascript:stripe.launch()'>try again</a>", 10000);
                    
                });
            
        }
    });
    stripe.launch = function (e) {
        if(e)e.preventDefault();
        $.closeModal();
        if (window.lifetime) {
            stripe.launchlifetime(auth.loggedInEmail());
        }
        else {
            stripe.launchmonthly(auth.loggedInEmail());
        }
    };
    stripe.launchlifetime = function (email) {
        // Open Checkout with further options:
        stripe.handler.open({
            name: 'Hurleyisms',
            description: 'Lifetime Access',
            amount: 9900,
            zipCode: true,
            email: email
        });

    };
    stripe.launchmonthly = function (email) {
        stripe.handler.open({
            name: 'Hurleyisms',
            description: 'Monthly Subscription',
            amount: 499,
            zipCode: true,
            email: email
        });
    };

    // Close Checkout on page navigation:
    $(window).on('popstate', function () {
        stripe.handler.close();
    });
    return stripe;
}();
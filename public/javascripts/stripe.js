$(function () {
    var handler = StripeCheckout.configure({
        key: 'pk_test_iuoiDTWygAIqVCAD4fZoP2Nc',
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

     launchlifetime = function(email) {
        // Open Checkout with further options:
        console.log("button clicked");
        handler.open({
            name: 'Hurleyisms',
            description: 'Lifetime Access',
            amount: 9900,
            zipCode: true,
            email: email
        });
     }
     launchmonthly = function(email) {
         handler.open({
             name: 'Hurleyisms',
             description: 'Monthly Subscription',
             amount: 499,
             zipCode: true,
             email: email
         });
     }

    // Close Checkout on page navigation:
    $(window).on('popstate', function () {
        handler.close();
    });
});
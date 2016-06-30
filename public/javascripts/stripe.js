$(function () {
    var handler = StripeCheckout.configure({
        key: 'pk_test_iuoiDTWygAIqVCAD4fZoP2Nc',
        image: 'images/apple-touch-icon-120.png',
        locale: 'auto',
        zipCode: true,
        token: function (token) {
            // You can access the token ID with `token.id`.
            // Get the token ID to your server-side code for use.
        }
    });

    $('#btnlifetime').on('click', function (e) {
        // Open Checkout with further options:
        console.log("button clicked");
        handler.open({
            name: 'Hurleyisms',
            description: 'Lifetime Access',
            amount: 9900
        });
        e.preventDefault();
    });

    // Close Checkout on page navigation:
    $(window).on('popstate', function () {
        handler.close();
    });
});
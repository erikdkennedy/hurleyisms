//Info for mail

var sg = require('sendgrid').SendGrid(process.env.SENDGRID_API_KEY)


var getBaseRequest = function (request, user) {
    request.body = {};
    request.body.from = {
        "email": "email@hurleyisms.com",
        "name": "Hurleyisms"
    };
    request.body.custom_args = {
        customer_name: user.name
    };
    request.body.content = [
    {
        "type": "text/html",
        "value": "<html><p>Hello, world!</p><img src=[CID GOES HERE]></img></html>"
    }
    ]
    request.body.personalizations = [{
        to: [
            {
                email: user.email,
                name: user.name
            }
        ]
    }];
    request.method = 'POST';
    request.path = '/v3/mail/send';
}
var sendInitialEmail = function (user, callback) {
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.template_id = "6717c2cb-73bd-48c4-b467-c2e039fb8e19";
    request.body.subject = "Hello, World!";
    sg.API(request, function (response) {
        console.log(response.statusCode)
        console.log(response.body)
        console.log(response.headers)
        callback();
    });
}
module.exports = {
    sendInitialEmail: sendInitialEmail
};
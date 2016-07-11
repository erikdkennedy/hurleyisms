//Info for mail

var sg = require('sendgrid').SendGrid(process.env.SENDGRID_API_KEY)


var getBaseRequest = function (request, user, url) {
    request.body = {};
    request.body.from = {
        "email": "email@hurleyisms.com",
        "name": "Hurleyisms"
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
        ],
        substitutions: {
            customer_name: user.name,
            email_url: url
        }

    }];
    request.method = 'POST';
    request.path = '/v3/mail/send';
}
var sendInitialEmail = function (user, callback) {
    var email_url = process.env.BASE_URL+"/email/"+user.email_code
    var request = sg.emptyRequest();
    getBaseRequest(request, user, email_url);
    request.body.template_id = "6717c2cb-73bd-48c4-b467-c2e039fb8e19";
    //request.body.personalizations[0].substitutions.email_url = email_url;
    request.body.subject = "Welcome to Hurleyisms";
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
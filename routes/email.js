//Info for mail

var sg = require('sendgrid').SendGrid(process.env.SENDGRID_API_KEY)


var getBaseRequest = function (request, user) {
    var imageUrl = process.env.BASE_URL + "/images/hurleyisms-xsm.png";
    var proUrl = process.env.BASE_URL + "/pro";
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
            image_url: imageUrl,
            pro_url: proUrl
        }
    }];
    request.method = 'POST';
    request.path = '/v3/mail/send';
}
var sendInitialEmail = function (user, callback) {
    var email_url = process.env.BASE_URL + "/email/email/" + user.verificationCode();
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.personalizations[0].substitutions.email_url = email_url;
    request.body.template_id = "6717c2cb-73bd-48c4-b467-c2e039fb8e19";
    request.body.subject = "Welcome to Hurleyisms";
    sg.API(request, function (response) {
        console.log(response.statusCode);
            console.log(response.body);
        console.log(response.headers);
        callback();
    });
}
var sendVerifyEmail = function (user, callback) {
    var email_url = process.env.BASE_URL + "/email/email/" + user.verificationCode();
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.personalizations[0].substitutions.email_url = email_url;
    request.body.template_id = "5da23ab1-12ac-49c8-a1bb-0d96c2fb4f5f";
    request.body.subject = "Verify your email Address";
    sg.API(request, function (response) {
        console.log(response.statusCode)
        console.log(response.body)
        console.log(response.headers)
        callback();
    });
}
var sendPasswordEmail = function (user, callback) {
    var email_url = process.env.BASE_URL + "/email/password/" + user.verificationCode();
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.personalizations[0].substitutions.email_url = email_url;
    request.body.template_id = "7894b34d-40f7-45da-870d-e5e7e0704d6e";
    request.body.subject = "Reset your password";
    sg.API(request, function (response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        callback();
    });
}
var sendCancellationEmail = function (user, callback) {
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.template_id = "51e69306-4ee0-4906-9029-8440ac52000e";
    request.body.subject = "Cancel Hurleyisms";
    sg.API(request, function (response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        callback();
    });
}
var sendUpgradeEmail = function (user, callback) {
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.template_id = "4dd08203-d0bb-481f-8719-36d045e7af5a";
    request.body.subject = "Upgrade to Hurleyisms Lifetime Access";
    sg.API(request, function (response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        callback();
    });
}
module.exports = {
    sendInitialEmail: sendInitialEmail,
    sendVerifyEmail: sendVerifyEmail,
    sendPasswordEmail: sendPasswordEmail,
    sendCancellationEmail: sendCancellationEmail,
    sendUpgradeEmail: sendUpgradeEmail
};
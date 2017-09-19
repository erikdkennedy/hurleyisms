//Info for mail

var sg = require('sendgrid').SendGrid(process.env.SENDGRID_API_KEY)


var getBaseRequest = function (request, user) {
    var imageUrl = process.env.BASE_URL + "https://hurleyisms.com/images/hurleyisms-xsm.png";
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
    request.body.template_id = "eab8ce54-c3d1-4a5a-a470-7fe9acdf0730";
    request.body.subject = "Welcome to Hurleyisms";
    sg.API(request, function (response) {
        callback();
    });
}
var sendVerifyEmail = function (user, callback) {
    var email_url = process.env.BASE_URL + "/email/email/" + user.verificationCode();
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.personalizations[0].substitutions.email_url = email_url;
    request.body.template_id = "66a2a8dd-7867-4cc5-9398-2fc24bd564c2";
    request.body.subject = "Verify your email Address";
    sg.API(request, function (response) {
        callback();
    });
}
var sendPasswordEmail = function (user, callback) {
    var email_url = process.env.BASE_URL + "/email/password/" + user.verificationCode();
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.personalizations[0].substitutions.email_url = email_url;
    request.body.template_id = "fd16d99c-27c4-4088-af12-fdb1a9b4d013";
    request.body.subject = "Reset your password";
    sg.API(request, function (response) {
        console.log(response);
        callback();
    });
}
var sendCancellationEmail = function (user, callback) {
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.template_id = "5a5c2361e-352e-4522-8b70-46602a260e1d";
    request.body.subject = "Cancel Hurleyisms";
    sg.API(request, function (response) {
        callback();
    });
}
var sendUpgradeEmail = function (user, callback) {
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.template_id = "7591524c-3ea0-4eb6-8aa2-1d402c63c840";
    request.body.subject = "Upgrade to Hurleyisms Lifetime Access";
    sg.API(request, function (response) {
        callback();
    });
}
var sendVIPEmail = function (user, callback) {
    var request = sg.emptyRequest();
    getBaseRequest(request, user);
    request.body.template_id = "6f31cb12-df6f-47e7-bbbf-c0d9a673f481";
    request.body.subject = "Welcome to Hurleyisms";
    sg.API(request, function (response) {
        callback();
    });
}
module.exports = {
    sendInitialEmail: sendInitialEmail,
    sendVerifyEmail: sendVerifyEmail,
    sendPasswordEmail: sendPasswordEmail,
    sendCancellationEmail: sendCancellationEmail,
    sendUpgradeEmail: sendUpgradeEmail,
    sendVIPEmail:sendVIPEmail
};
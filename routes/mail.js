var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
var sendUpdateCookie = function (res, user, content) {
    setCookie(res, user);
    sendJSONresponse(res, 200, content);
};

var setCookie = function (res, user) {
    token = user.generateJwt();
    res.cookie('auth', token, { secure: true, maxAge: 604800000 });
}

router.get('/:code', function (req, res) {
    var code = req.params.code;
    if (code) {
        console.log("Verifying email ");
        User
        .findOne({ email_code: code })
        .exec(function (err, user) {
            if (!user) {
                sendJSONresponse(res, 404, {
                    "message": "User not found"
                });
                return;
            } else if (err) {
                console.log(err);
                sendJSONresponse(res, 404, err);
                return;
            }
            user.emailverified = true;
            user.email_code = undefined;
            user.save(function (err) {
                if (err) {
                    sendJSONresponse(res, 404, err);
                } else {
                    setCookie(res, user);
                    res.redirect("/app");
                }
            });

        });
    } else {
        sendJSONresponse(res, 404, {
            "message": "code not present"
        });
        return;
    }


});
module.exports = router;

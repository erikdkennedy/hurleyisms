var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');

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

router.get('/email/:code', function (req, res) {
    var code = req.params.code;
    jwt.verify(code, process.env.JWT_SECRET, function (err, decoded) {
        if (err || !decoded.email) {
            sendJSONresponse(res, 404, {
                "message": "invalid code"
            });
        }
        else {
            User
            .findOne({ email: decoded.email })
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
                user.save(function (err) {
                    if (err) {
                        sendJSONresponse(res, 404, err);
                    } else {
                        setCookie(res, user);
                        res.redirect("/app?email-verified=true");
                    }
                });

            });
        }
    });
});

router.get('/password/:code', function (req, res) {
    var code = req.params.code;
    jwt.verify(code, process.env.JWT_SECRET, function (err, decoded) {
        if (err || !decoded.email) {
            sendJSONresponse(res, 404, {
                "message": "invalid code"
            });
        }
        else {
            User
            .findOne({ email: decoded.email })
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
                setCookie(res, user);
                res.redirect("/app?enter-new-password=true");
            });
        }
    });
});
module.exports = router;

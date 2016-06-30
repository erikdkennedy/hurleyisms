var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');


var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

router.post('/register', function (req, res) {
    console.log("Register called");
    if (!req.body.name || !req.body.email || !req.body.password) {
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }

    var user = new User();

    user.name = req.body.name;
    user.email = req.body.email;

    user.setPassword(req.body.password);

    user.save(function (err) {
        var token;
        if (err) {
            sendJSONresponse(res, 404, err);
        } else {
            token = user.generateJwt();
            res.cookie('auth', token, { path: '/', httpOnly: true, maxAge: 604800000 });
            sendJSONresponse(res, 200, {
            });
        }
    });

});

router.post('/login', function (req, res) {
    console.log("Login Called");
    if (!req.body.email || !req.body.password) {
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }

    passport.authenticate('local', function (err, user, info) {
        var token;

        if (err) {
            sendJSONresponse(res, 404, err);
            return;
        }

        if (user) {
            token = user.generateJwt();
            res.cookie('auth', token, { path: '/', httpOnly: true, maxAge: 604800000 });
            sendJSONresponse(res, 200, {
            });
        } else {
            sendJSONresponse(res, 401, info);
        }

    })(req, res);
});
module.exports = router;
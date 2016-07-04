var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var stripe = require("stripe")(process.env.STRIPE_KEY);
var helpers = require('./helpers');
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var setCookie = function (res, user) {
    token = user.generateJwt();
    res.cookie('auth', token, { secure:true, maxAge: 604800000 });
}
var getUser = function (req, res, callback) {
    if (req.payload && req.payload.email) {
        User
        .findOne({ email: req.payload.email })
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
            } callback(req, res, user);
        });
    } else {
        sendJSONresponse(res, 404, {
            "message": "User not found"
        });
        return;
    }
};
router.post('/register', function (req, res) {
    console.log("Register called");
    if (!req.body.name || !req.body.email || !req.body.password) {
        console.log("All fields are not present");
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
        if (err) {
            sendJSONresponse(res, 404, err);
        } else {
            setCookie(res, user);
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
            setCookie(res, user);
            sendJSONresponse(res, 200, {
            });
        } else {
            sendJSONresponse(res, 401, info);
        }

    })(req, res);
});
router.post('/lifetime', function (req, res) {
    if (!(req.payload && req.payload.email)) {
        sendJSONresponse(res, 401);
        return;
    }
    if (!req.body.token) {
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    getUser(req, res, function (req, res, user) {
        user.token = req.body.token;
        charge = stripe.charges.create({
            amount: 9900, // amount in cents, again
            currency: "usd",
            source: user.token,
            description: "Life Time Access"
        }, function (err, charge) {
            if (err && err.type === 'StripeCardError') {
                // The card has been declined
                //TODO: Stop further execution
            }
            console.log(charge);
            user.pro = true;
            user.chargeid = charge.id;
            user.type = "lifetime";
            user.save(function (err) {
                if (err) {
                    sendJSONresponse(res, 404, err);
                } else {
                    sendJSONresponse(res, 200, { status: 'success' });
                }
            });
        });
    });
});
router.post('/monthly', function (req, res) {
    if (!(req.payload && req.payload.email)) {
        sendJSONresponse(res, 401);
        return;
    }
    if (!req.body.token) {
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    getUser(req, res, function (req, res, user) {
        user.token = req.body.token;
        stripe.customers.create({
            source: user.token,
            plan: "Monthly",
            email: user.email
        }, function (err, customer) {
            if (err && err.type === 'StripeCardError') {
                // The card has been declined
                //TODO: Stop further execution
            }
            console.log(customer);
            user.pro = true;
            user.customerid = customer.id,
            user.type = "monthly";
            user.save(function (err) {
                if (err) {
                    sendJSONresponse(res, 404, err);
                } else {
                    sendJSONresponse(res, 200, { status: 'success' });
                }
            });
        });
    });
});
router.post('/logout',  function (req, res) {
    res.clearCookie('auth');
    sendJSONresponse(res, 200, { status: 'success' });
});


module.exports = router;
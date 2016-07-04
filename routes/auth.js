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
var sendUpdateCookie = function (res, user, content) {
    setCookie(res, user);
    sendJSONresponse(res, 200, content);
};

var setCookie = function (res, user) {
    token = user.generateJwt();
    res.cookie('auth', token, { secure: true, maxAge: 604800000 });
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
            sendUpdateCookie(res, user, { status: 'success' });
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
            sendUpdateCookie(res, user, { status: 'success' });
        } else {
            sendJSONresponse(res, 401, info);
        }

    })(req, res);
});
router.post('/lifetime', helpers.onlyLoggedIn, function (req, res) {
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
        if (user.isMonthly()) {
            sendJSONresponse(res, 404, { error: "You are already a monthly subscriber" });
            return;
        }
        if (user.isLifetime()) {
            sendJSONresponse(res, 404, { error: "You are already a lifetime subscriber" });
            return;
        }
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
                    sendUpdateCookie(res, user, { status: 'success' });
                }
            });
        });
    });
});
router.post('/monthly', helpers.onlyLoggedIn, function (req, res) {
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
        if (user.isMonthly()) {
            sendJSONresponse(res, 404, { error: "You are already a monthly subscriber" });
            return;
        }
        if (user.isLifetime()) {
            sendJSONresponse(res, 404, { error: "You are already a lifetime subscriber" });
            return;
        }
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
            user.subscriptionid = customer.subscriptions.data[0].id;
            user.type = "monthly";
            user.save(function (err) {
                if (err) {
                    sendJSONresponse(res, 404, err);
                } else {
                    sendUpdateCookie(res, user, { status: 'success' });
                }
            });
        });
    });
});
router.post('/cancel', helpers.onlyLoggedIn, function (req, res) {
    getUser(req, res, function (req, res, user) {
        if (!user.isMonthly()) {
            sendJSONresponse(res, 404, { error: "You are not a monthly subscriber" });
            return;
        }

        stripe.subscriptions.del(user.subscriptionid, function (error, confirmation) {
            if (!error) {
                user.pro = false;
                user.type = undefined;
                user.save(function (err) {
                    if (err) {
                        sendJSONresponse(res, 404, err);
                    } else {
                        sendUpdateCookie(res, user, { status: 'success' });
                    }
                });
            }
            else {
                sendJSONresponse(res, 404, error);
            }

        });

        
    });
});
router.post('/email', helpers.onlyLoggedIn, function (req, res) {
    if (!req.body.email) {
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    getUser(req, res, function (req, res, user) {
        user.email = req.body.email;
        user.save(function (err) {
            if (err) {
                sendJSONresponse(res, 404, err);
            } else {
                sendUpdateCookie(res, user, { status: 'success' });
            }
        });
    });
});
router.post('/password', helpers.onlyLoggedIn, function (req, res) {
    if (!req.body.password) {
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    getUser(req, res, function (req, res, user) {
        user.setPassword(req.body.password);
        user.save(function (err) {
            if (err) {
                sendJSONresponse(res, 404, err);
            } else {
                sendUpdateCookie(res, user, { status: 'success' });
            }
        });
    });
});
router.post('/logout', function (req, res) {
    res.clearCookie('auth');
    sendJSONresponse(res, 200, { status: 'success' });
});


module.exports = router;
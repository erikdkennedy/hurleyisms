var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var stripe = require("stripe")(process.env.STRIPE_KEY);
var helpers = require('./helpers');
var xssFilters = require('xss-filters');
var email = require("./email");
var crypto = require('crypto');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};
var sendUpdateCookie = function(res, user, content) {
    setCookie(res, user);
    sendJSONresponse(res, 200, content);
};

var setCookie = function(res, user) {
    token = user.generateJwt();
    res.cookie('auth', token, {
        secure: true,
        maxAge: 604800000
    });
};
var getUser = function(req, res, callback) {
    if (req.payload && req.payload.email) {
        User
            .findOne({
                email: req.payload.email
            })
            .exec(function(err, user) {
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
                callback(req, res, user);
            });
    } else {
        sendJSONresponse(res, 404, {
            "message": "User not found"
        });
        return;
    }
};
//Gets a coupon code from stripe.
//If the coupon doesn't exists then callback
var getCoupon = function(couponcode, callback) {
    //If coupon code is null, then return the null callback
    if (!couponcode) {
        callback();
        return;
    }
    stripe.coupons.retrieve(
        couponcode,
        function(err, coupon) {
            if (err) {
                callback();
                return;
            }
            callback(coupon);
        }

    );

}
var convertAmountForCoupon = function(amount, coupon) {
    if (!coupon) return amount;
    if (coupon.percent_off && coupon.percent_off != null) {
        var newAmount = (amount * (100 - coupon.percent_off)) / 100;
        if (newAmount >= 0) return newAmount;
    }
    if (coupon.amount_off && coupon.amount_off != null) {
        var newAmount = amount - coupon.amount_off;
        if (newAmount >= 0) return newAmount;
    }

    return amount;
}
router.post('/register', function(req, res) {
    console.log("Register called");
    if (!req.body.name || !req.body.email || !req.body.password) {
        console.log("All fields are not present");
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    getCoupon(req.body.couponcode, function(coupon) {
        //If they presented a coupon but the coupon does not exist then send an error
        if (!coupon && req.body.coupon) {
            sendJSONresponse(res, 400, {
                "message": "Invalid Coupon"
            });
            return;
        }
        if (coupon && !coupon.valid) {
            sendJSONresponse(res, 400, {
                "message": "Coupon is no longer valid"
            });
            return;
        }
        var user = new User();
        user.name = xssFilters.inHTMLData(req.body.name);
        user.email = xssFilters.inHTMLData(req.body.email);
        if (coupon) {
            user.couponcode = xssFilters.inHTMLData(req.body.couponcode);
        }
        user.signupip = helpers.getIpAddress(req);
        user.setPassword(req.body.password);
        user.save(function(err) {
            if (err) {
                console.log("error creating mongo user");
                sendJSONresponse(res, 404, err);
            } else {
                email.sendInitialEmail(user, function() {
                    sendUpdateCookie(res, user, {
                        status: 'success'
                    });
                });
            }
        });
    });

});
router.post('/login', function(req, res) {
    console.log("Login Called");
    if (!req.body.email || !req.body.password) {
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }

    passport.authenticate('local', function(err, user, info) {
        var token;

        if (err) {
            sendJSONresponse(res, 404, err);
            return;
        }

        if (user) {
            sendUpdateCookie(res, user, {
                status: 'success'
            });
        } else {
            sendJSONresponse(res, 401, info);
        }

    })(req, res);
});
router.post('/lifetime', helpers.onlyLoggedIn, function(req, res) {
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
    getUser(req, res, function(req, res, user) {
        var wasMonthly = false;
        if (user.isLifetime()) {
            sendJSONresponse(res, 404, {
                error: "You are already a lifetime subscriber"
            });
            return;
        }
        if (user.isMonthly()) {
            //if they are a monthly user than delete their subscription
            stripe.subscriptions.del(user.subscriptionid);
            wasMonthly = true;
        }
        user.token = req.body.token;
        var amount = 9900;
        getCoupon(user.couponcode, function(coupon) {
            if (coupon) {
                amount = convertAmountForCoupon(amount, coupon);
            }
            stripe.charges.create({
                amount: amount, // amount in cents
                currency: "usd",
                source: user.token,
                description: "Life Time Access"
            }, function(err, charge) {
                if (err && err.type === 'StripeCardError') {
                    // The card has been declined
                    sendJSONresponse(res, 401, {
                        error: "Card was declined",
                        declined: true
                    });
                    return;
                }
                console.log(charge);
                user.pro = true;
                user.chargeid = charge.id;
                user.type = "lifetime";
                user.prodate = Date.now();
                user.save(function(err) {
                    if (err) {
                        sendJSONresponse(res, 404, err);
                    } else {
                        if (wasMonthly) {
                            email.sendUpgradeEmail(user, function() {
                                sendUpdateCookie(res, user, {
                                    status: 'success'
                                });
                            });
                        } else {
                            sendUpdateCookie(res, user, {
                                status: 'success'
                            });
                        }

                    }
                });
            });
        });
    });
});
router.post('/monthly', helpers.onlyLoggedIn, function(req, res) {
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
    getUser(req, res, function(req, res, user) {
        if (user.isMonthly()) {
            sendJSONresponse(res, 404, {
                error: "You are already a monthly subscriber"
            });
            return;
        }
        if (user.isLifetime()) {
            sendJSONresponse(res, 404, {
                error: "You are already a lifetime subscriber"
            });
            return;
        }
        user.token = req.body.token;
        var customerReq = {
            source: user.token,
            plan: "Monthly",
            email: user.email
        };
        if (user.couponcode) {
            customerReq.coupon = user.couponcode
        };
        stripe.customers.create(customerReq, function(err, customer) {
            if (err && err.type === 'StripeCardError') {
                // The card has been declined
                //TODO: Stop further execution
                sendJSONresponse(res, 401, {
                    error: "Card was declined",
                    declined: true
                });
                return;
            }
            if (err) {
                sendJSONresponse(res, 401, {
                    error: "Error processing payment",
                    declined: true
                });
                return;
            }
            console.log(customer);
            user.pro = true;
            user.customerid = customer.id,
                user.subscriptionid = customer.subscriptions.data[0].id;
            user.type = "monthly";
            user.prodate = Date.now();
            user.save(function(err) {
                if (err) {
                    sendJSONresponse(res, 404, err);
                } else {
                    sendUpdateCookie(res, user, {
                        status: 'success'
                    });
                }
            });
        });
    });
});
router.get('/amount/:amount', helpers.onlyLoggedIn, function(req, res) {
    console.log("amount called");
    if (!req.params.amount) {
        sendJSONresponse(res, 404, {
            error: "Invalid Request"
        });
        return;
    }
    var amount = parseInt(req.params.amount);
    getUser(req, res, function(req, res, user) {
        getCoupon(user.couponcode, function(coupon) {
            amount = convertAmountForCoupon(amount, coupon);
            sendJSONresponse(res, 200, {
                "amount": amount
            });
        });
    });
});
router.post('/cancel', helpers.onlyLoggedIn, function(req, res) {
    getUser(req, res, function(req, res, user) {
        if (!user.isMonthly()) {
            sendJSONresponse(res, 404, {
                error: "You are not a monthly subscriber"
            });
            return;
        }

        stripe.subscriptions.del(user.subscriptionid, function(error, confirmation) {
            if (!error) {
                user.pro = false;
                user.type = undefined;
                user.save(function(err) {
                    if (err) {
                        sendJSONresponse(res, 404, err);
                    } else {
                        email.sendCancellationEmail(user, function() {
                            sendUpdateCookie(res, user, {
                                status: 'success'
                            })
                        });
                    }
                });
            } else {
                sendJSONresponse(res, 404, error);
            }

        });


    });
});
router.get('/verifyemail', helpers.onlyLoggedIn, function(req, res) {
    getUser(req, res, function(req, res, user) {
        email.sendVerifyEmail(user, function() {
            sendUpdateCookie(res, user, {
                status: 'success'
            });
        });
    });
});
router.post('/email', helpers.onlyLoggedIn, function(req, res) {
    if (!req.body.email) {
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    getUser(req, res, function(req, res, user) {
        user.email = xssFilters.inHTMLData(req.body.email);
        user.email_code = crypto.randomBytes(100).toString('hex');
        user.emailverified = false;
        user.save(function(err) {
            if (err) {

                sendJSONresponse(res, 404, err);
            } else {
                email.sendInitialEmail(user, function() {
                    sendUpdateCookie(res, user, {
                        status: 'success'
                    });
                });
            }
        });
    });
});
router.post('/password', helpers.onlyLoggedIn, function(req, res) {
    if (!req.body.password) {
        sendJSONresponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    getUser(req, res, function(req, res, user) {
        user.setPassword(req.body.password);
        user.save(function(err) {
            if (err) {
                sendJSONresponse(res, 404, err);
            } else {
                sendUpdateCookie(res, user, {
                    status: 'success'
                });
            }
        });
    });
});
router.post('/logout', function(req, res) {
    res.clearCookie('auth');
    sendJSONresponse(res, 200, {
        status: 'success'
    });
});
router.post('/forgotPassword', function(req, res) {
    if (!req.body.email) {
        sendJSONresponse(res, 400, {
            "message": "email required"
        });
        return;
    }
    var emailAddr = req.body.email.toLowerCase();
    User
        .findOne({
            email: emailAddr
        })
        .exec(function(err, user) {
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
            email.sendPasswordEmail(user, function() {
                sendJSONresponse(res, 200, {
                    status: "success"
                });
            });
        });
});
router.get('/coupon/:code', function(req, res) {

});

module.exports = router;
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var stripe = require("stripe")(process.env.STRIPE_KEY);
var email = require("./email");
var crypto = require('crypto');
var helpers = require('./helpers');

var createVIPMembership = function (user, req, res) {
    console.log("VIP User Created");
    user.pro = true;
    user.type = "vip";
    user.prodate = Date.now();
    var customerReq = {
        plan: "HurleyismsVIP",
        email: user.email
    };
    if (user.couponcode) {
        customerReq.coupon = user.couponcode
    };
    stripe.customers.create(customerReq, function (stripeerr, customer) {
        if(stripeerr)
        {
            helpers.sendErrorResponse(res,500,"User could not be created");
            return;
        }
        user.save(function (err) {
            if (err) {
                console.log();
                helpers.sendErrorResponse(res, 500, "This email has already been taken.  <a href='#' data-modal='login-modal'>Login</a> if it's yours");
            } else {
                email.sendVIPEmail(user, function () {
                    helpers.sendUpdateCookie(res, user, {
                        status: 'success'
                    });
                });
            }
        });
    });
}

module.exports = {
    createVIPMembership: createVIPMembership
}
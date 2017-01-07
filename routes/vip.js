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
    user.save(function (err) {
        if (err) {
            console.log();
            helpers.sendErrorResponse(res, 500, "This email has already been taken.  <a href='#' data-modal='login-modal'>Login</a> if it's yours");
        } else {
            email.sendInitialEmail(user, function () {
                helpers.sendUpdateCookie(res, user, {
                    status: 'success'
                });
            });
        }
    });
}

module.exports = {
    createVIPMembership: createVIPMembership
}
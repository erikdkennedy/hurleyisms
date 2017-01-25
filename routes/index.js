var express = require('express');
var router = express.Router();
var path = require('path');
var helpers = require('./helpers');
/* GET home page. */


router.get('/', function (req, res) {
    if (helpers.isLoggedIn(req)) {
        res.redirect("app");
    }
    else {
        res.sendFile(path.join(__dirname, '../public', 'main.html'));
    }
});

router.get('/pro', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'pro.html'));
});
router.get('/my-account', helpers.onlyLoggedIn, function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'my-account.html'));
});
router.get('/terms', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'termsofservice.html'));
});
router.get('/privacy', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'privacy.html'));
});
router.get('/vip', function (req, res) {
    res.redirect("pro?coupon=5DAYDEAL");
});

module.exports = router;

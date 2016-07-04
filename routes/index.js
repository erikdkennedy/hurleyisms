var express = require('express');
var router = express.Router();
var path = require('path');
var helpers = require('./helpers');
/* GET home page. */


router.get('/', function (req, res, next) {
    console.log("getting index");
    if (helpers.isLoggedIn(req)) {
        res.redirect("app");
    }
    else {
        res.sendFile(path.join(__dirname, '../public', 'main.html'));
    }
});

router.get('/pro', function (req, res, next) {
    console.log(req.payload);
    res.sendFile(path.join(__dirname, '../public', 'pro.html'));
});

router.get('/my-account', helpers.onlyLoggedIn, function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public', 'my-account.html'));
});

module.exports = router;

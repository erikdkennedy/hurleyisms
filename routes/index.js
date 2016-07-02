var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */


router.get('/', function(req, res, next) {
    res.sendFile('public/index.html');
});

router.get('/pro', function (req, res, next) {
    console.log(req.payload);
    res.sendFile(path.join(__dirname,'../public','pro.html'));
});

router.get('/my-account', function(req, res, next) {
    res.sendFile(path.join(__dirname,'../public','my-account.html'));
});

module.exports = router;

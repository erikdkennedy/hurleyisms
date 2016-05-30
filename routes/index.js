var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Lines = mongoose.model('Line');
var banlist = mongoose.model('Banlist');
/* GET home page. */


router.get('/', function(req, res, next) {
    res.sendFile('public/index.html');
});

module.exports = router;

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Lines = mongoose.model('Line');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile('public/index.html');
});
router.get('/data', function (req, res) {
    console.log("got here");
    Lines.find({}, function(err,results){
        console.log(results);
        res.json(results);
    });
   
});
router.post('/data', function (req, res) {
    console.log('we got to the post');
    Lines.create(req.body, function (err, result) {
        console.log("err:" + err);
        console.log("result:" + result);
        sendJSONresponse(res, 200, result)
    });
});

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
module.exports = router;

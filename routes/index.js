var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Lines = mongoose.model('Line');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile('public/index.html');
});
router.get('/data/:audience/:profanity', function (req, res) {
    console.log("got here");
    console.log("audience " + req.params.audience);
    query = { kids: true };
    switch(Number(req.params.audience))
    {
        case 0:
            query = { men: true };
            console.log("men");
            break;
        case 1:
            query = { women: true };
            console.log("women");
            break;
        case 2:
            query = { kids: true };
            console.log("kids");
    }
    var profanity = JSON.parse(req.params.profanity);
    query.profanity = profanity;
    Lines.find(query, function(err,results){
        console.log("query returned "+results.length)
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

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Lines = mongoose.model('Line');
var Users = mongoose.model('User');
var path = require('path');
var helpers = require('./helpers');
var xssFilters = require('xss-filters');
/* GET home page. */


router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'app.html'));
});


router.get('/data/:audience/:profanity', function (req, res) {
    console.log("audience " + req.params.audience);
    query = {};
    switch (Number(req.params.audience)) {
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
            break;
        case 3:
            query = { couples: true };
            console.log("couples");
            break;
        case 4:
            query = { weddings: true };
            console.log("weddings");
            break;
    }
    var profanityOn = JSON.parse(req.params.profanity);
    if (profanityOn) {
        query = { $or: [query, { profanity: profanityOn }] };
    }
    else { query.profanity = false; }
    //only show approved
    query.approved = true;

    //only show free to non-pro users
    if (!helpers.isPro(req)) query.free = true;

    console.log(query);
    Lines.find(query, function (err, results) {
        console.log("query returned " + results.length);
        res.json(results);
    });
});
router.post('/add', helpers.onlyEmailVerified, function (req, res) {
    console.log("add called");
    var line = req.body;

    line.ipaddress = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    //Check to see if user has been banned
    console.log(line);

    Users.findById(req.payload._id).exec(function (err, user) {
        if (user.banned) {
            console.error("Banned User tried to create record");
            sendJSONresponse(res, 403, { message: "You have been banned from submitting lines" });
        } else {
            console.log("adding record " + line);
            //filter out any XSS data
            line.line = xssFilters.inHTMLData(line.line);
            line.author = user.name;
            line.authorid = user._id;
            //create the line
            Lines.create(line,
                function (err, result) {
                    console.log("err:" + err);
                    console.log("result:" + result);
                    sendJSONresponse(res, 200, result);
                });
        }
    });
});
//not currently doing line voting functionality
/*router.get('/rate/:lineid/:vote', function (req, res) {
    console.log("vote called");
    Lines.findById(req.params.lineid).exec(function (err, line) {
        if (req.params.vote === "true") line.rating++;
        else line.rating--;
        line.save(function (err, line) {
            sendJSONresponse(res, 200, line);
        });
    });
});
*/
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports = router;

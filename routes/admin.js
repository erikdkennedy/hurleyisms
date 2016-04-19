var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var lines = mongoose.model('Line');
var banlist = mongoose.model('Banlist');
var path = require('path');
var passport = require('passport');


router.get('/', passport.authenticate('basic', { session: false }), function (req, res, next) {
    res.sendFile(path.join(__dirname,'../public','admin.html'));
});
router.get('/data', function (req, res) {
    lines.find({}).sort({ dateadded: -1 }).exec(function (err, allLines) {
        console.log(allLines);
        console.log(err);
        res.json(allLines);
    });
});
router.get('/:id/approve', function (req, res) {
    var id = req.params.id;
    console.log("call to approve "+id);
    lines.findByIdAndUpdate(id,{ $set:{approved : true}}, function (err, line) {
        console.log(line);
        sendJSONresponse(res, 200, line);
    });
});
router.get('/:id/delete', function (req, res) {
    var id = req.params.id;
    console.log("call to delete " + id);
    lines.findByIdAndRemove(id, function () {
        sendJSONresponse(res, 200, { status: "success" });
    });
});
router.post('/ban', function (req, res) {
    var line = req.body;
    console.log("call to ban " + line.ipaddress);
    banlist.create({ ipaddress: line.ipaddress }, function (err, bannedip) {
        lines.remove({ ipaddress: line.ipaddress }, function (err) {
            sendJSONresponse(res, 200, { status: "success" });
        });
    });
});
router.post('/update', function (req, res) {
    var line = req.body;
    console.log("call to update " + line._id);
    console.log(line);
    var id = line._id;
    //strip the ID and v
    delete line._id;
    delete line.v;
    lines.findByIdAndUpdate(id, { $set: line }, function (err, line) {
        console.log(err);
        console.log(line);
        sendJSONresponse(res, 200, line);
    });
});


var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
module.exports = router;

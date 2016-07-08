var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var events = mongoose.model('events');
var stripe = require("stripe")(process.env.STRIPE_KEY);
router.post("/", function (req, res) {
    console.log("we are here");
    console.log(req.body);
    // Retrieve the request's body and parse it as JSON
    //var event_json = JSON.parse(req.body);
    //console.log(event_json);
    //stripe.events.retrieve(
    //event_json.id
    //function (err, event_recv) {
    var event = {};
    //event.id = event_json.id;
    event.event = req.body;
    events.create(event, function (err, result) {
        console.log(err);
        res.sendStatus(200);
    });
    // }
    //);
});


module.exports = router;

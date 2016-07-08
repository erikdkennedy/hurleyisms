var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var events = mongoose.model('events');
var stripe = require("stripe")(process.env.STRIPE_KEY);
router.post("/", function (req, res) {
    console.log(req.body);
    if (req.body && req.body.id) {
        stripe.events.retrieve(req.body.id, function (err, event_recv) {
            var event = {};
            event.id = event_recv.id;
            event.event = event_recv;
            events.create(event, function (err, result) {
                console.log(err);
                res.sendStatus(200);
            });
        });
    }
});
module.exports = router;

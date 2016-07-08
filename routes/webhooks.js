var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var events = mongoose.model('events');
var stripe = require("stripe")(process.env.STRIPE_KEY);
router.post("/", function (req, res) {
    console.log(req.body);
    if (req.body && req.body.id) {
        stripe.events.retrieve(req.body.id, function (err, event_recv) {
            if (err) {
                console.error(err);
                res.sendStatus(404);
            }
            else {
                var event = {};
                event.id = event_recv.id;
                event.event = event_recv;
                events.create(event, function (err, result) {
                    console.log(err);
                    res.sendStatus(200);
                });
            }
        });
    }
    else
    {
        res.sendStatus(400);
    }
});
module.exports = router;

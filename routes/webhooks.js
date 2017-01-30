var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var User = mongoose.model('User')
var events = mongoose.model('events')
var helpers = require('./helpers')
var stripe = require('stripe')(process.env.STRIPE_KEY)

function findUserByCustId (req, res, next) {
  if (req.body && req.body.data && req.body.data.object && req.body.data.object.customer) {
    var customerid = req.body.data.object.customer
    User.findOne({ customerid: customerid }).exec(function (err, user) {
      if (!err && user) {
        req.user = user
      }
      return next()
    })
  }
}

router.post('/', findUserByCustId, function (req, res) {
  if (!req.body || !req.body.id) { res.sendStatus(200); return;}
  stripe.events.retrieve(req.body.id, function (err, event_recv) {
    console.log("event"+event_recv.type);
    if (err) {
      console.error(err)
      // We need to fail with a 200 so that stripe will keep sending
      res.sendStatus(200)
      return
    }

    var event = {}
    event.event_id = event_recv.id
    event.event = event_recv
    events.create(event, function (err, result) {
      console.log(err)
      
      if (event_recv.type == 'customer.subscription.created') {
        setSubscription(req, res, event_recv, function(){

        });
      }
      else{res.sendStatus(200); return}
    })
  })
})
function setSubscription (req, res, event) {
    console.log("subscription event");
  // get the subscription they have been added to
  if (req.user && event && event.data && event.data.object && event.data.object.items && event.data.object.items && event.data.object.items.data && event.data.object.items.data[0] && event.data.object.items.data[0].plan.id) {
    var subscription = event.data.object.items.data[0].plan.id
    req.user.subscriptionid = event.data.object.items.data[0].id
    req.user.pro = true
    req.user.prodate = Date.now()

    switch (subscription) {
      case 'HurleyismsVIP':
        req.user.type = 'vip'
        break
      case 'Monthly':
        req.user.type = 'monthly'
        break
    }
    req.user.save(function (err) {
      if (err) console.err(err)
      res.sendStatus(200); return
    })
  }else {
    console.log('Malformed subscription event')
    res.sendStatus(200); return
  }
}
module.exports = router

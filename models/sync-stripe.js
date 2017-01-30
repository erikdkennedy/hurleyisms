require('dotenv').config()
require('./db.js')
var mongoose = require('mongoose')
var userModel = mongoose.model('User')
var stripe = require('stripe')(process.env.STRIPE_KEY)

var customers = []

function queryCustomers (lastCustomer) {
  var params = {limit: 100}
  if (lastCustomer) params.starting_after = lastCustomer
  stripe.customers.list(params, function (err, resp) {
    console.log("recieved resp: " +resp.data.length)
    for (var x in resp.data) {
      customers.push(resp.data[x])
    }
    if (resp.data.length == 100) {
      queryCustomers(resp.data[resp.data.length - 1])
    }else {
      console.log(customers)
    }
  })
}
queryCustomers();
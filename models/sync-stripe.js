require('dotenv').config({path:"/Users/andrew/Development/hurleyisms/prod.env"})
require('./db.js')
var mongoose = require('mongoose')
var userModel = mongoose.model('User')
var stripe = require('stripe')(process.env.STRIPE_KEY)

var customers = []
var dupeCount = 0;
function queryCustomers(lastCustomer) {
  var params = { limit: 100 }
  if (lastCustomer) params.starting_after = lastCustomer
  stripe.customers.list(params, function (err, resp) {
    if(err){
  console.error(err)
  process.exit();

    }
    console.log("recieved resp: " + resp.data.length)
    for (var x in resp.data) {
     // console.log(resp.data[x])
      customers.push(resp.data[x])
    }
    if (resp.data.length == 100) {
      queryCustomers(resp.data[resp.data.length - 1].id)
    } else {
      updateSubscriptions();
    }
  })
}

function findCustomer(email) {
  var result = null;
  for (var x in customers) {
    var cust = customers[x];
    if (cust.email == email) {
      if (result) {
        console.log(email);
        dupeCount += 1;
      }
      result = cust;
    }
  }
  return result;
}
function findCustomerbyid(id) {
  var result = null;
  for (var x in customers) {
    var cust = customers[x];
    if (cust.id == id) {
      result = cust;
    }
  }
  return result;
}
function updateSubscriptions()
{
    userModel.find({type:"monthly",pro:true, subscriptionid:{$regex:"si.*"}}, function (err, users) {
    for(var x in users){
      dbUser = users[x];
      stUser = findCustomerbyid(dbUser.customerid)
      if(stUser && stUser.subscriptions && stUser.subscriptions.data && stUser.subscriptions.data[0] && stUser.subscriptions.data[0].id)
      {
        var id = stUser.subscriptions.data[0].id
        if(id !== dbUser.subscriptionid)
        {
          console.log(id + ","+ dbUser.subscriptionid);
          dbUser.subscriptionid = id;
          dbUser.save();
        }
      }
      else{
        console.log(dbUser.subscriptionid )
        dbUser.pro = false
        dbUser.prodate = undefined;
        dbUser.type = undefined;
        dbUser.subscriptionid = undefined;
        dbUser.save();
      }
    }

    });
}
function testDupes()
{
  console.log("dupes");
  for(var x in customers)
  {
    findCustomer(customers[x].email);
  }
  console.log("dupe count " + dupeCount)
  match();
}
function match() {
  userModel.find({ customerid: { $exists: true } }, function (err, users) {
    for (var x in users) {
      var customer = findCustomer(users[x].email);
      if (customer) {
        if (customer.id == users[x].customerid) {
          console.log(customer.email + " is in sync");
        }
        else {
          console.error(customer.email + " is not in sync")
          users[x].customerid = customer.id;
          users[x].save();
        }
      }
      else {
        console.error(users[x].email + " is not in stripe");
      }
    }
//process.exit();
  })
}

queryCustomers();
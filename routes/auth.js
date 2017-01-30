var express = require('express')
var router = express.Router()
var passport = require('passport')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var stripe = require('stripe')(process.env.STRIPE_KEY)
var helpers = require('./helpers')
var xssFilters = require('xss-filters')
var email = require('./email')
var crypto = require('crypto')

var vip = require('./vip')

var convertAmountForCoupon = function (amount, coupon) {
  if (!coupon) return amount
  if (coupon.percent_off && coupon.percent_off != null) {
    var newAmount = (amount * (100 - coupon.percent_off)) / 100
    if (newAmount >= 0) return newAmount
  }
  if (coupon.amount_off && coupon.amount_off != null) {
    var newAmount = amount - coupon.amount_off
    if (newAmount >= 0) return newAmount
  }

  return amount
}
// Make a function to vaildate the correct parameters AND
// make sure the user doesn't already exist.
function verifyCanRegister (req, res, next) {
  if (!req.body.name || !req.body.email || !req.body.password) {
    console.log('All fields are not present')
    helpers.sendJSONResponse(res, 400, {
      'error': 'All fields required'
    })
  }
  User.findOne({email: req.body.email}).exec(function (err, user) {
    if (err || !user) {
      return next()
    }else {
      helpers.sendErrorResponse(res, 500, "This email has already been taken.  <a href='#' data-modal='login-modal'>Login</a> if it's yours")
    }
  }
  )
}
router.post('/register', helpers.getCoupon, function (req, res) {

  // If they presented a coupon but the coupon does not exist then send an error
  if (!req.coupon && req.body.coupon) {
    helpers.sendJSONResponse(res, 400, {
      'error': 'Invalid Coupon'
    })
    return
  }
  if (req.coupon && !req.coupon.valid) {
    helpers.sendJSONResponse(res, 400, {
      'error': 'Coupon is no longer valid'
    })
    return
  }
  var user = new User()
  user.name = xssFilters.inHTMLData(req.body.name)
  user.email = xssFilters.inHTMLData(req.body.email)
  user.signupip = helpers.getIpAddress(req)
  user.setPassword(req.body.password)

  if (req.coupon) {
    user.couponcode = xssFilters.inHTMLData(req.coupon.id)
  }
  if (req.coupon && req.coupon.valid) {
    var clientCoupon = {}
    clientCoupon['amount_off'] = req.coupon.amount_off
    clientCoupon['percent_off'] = req.coupon.percent_off
    if (req.coupon.percent_off === 100) {
      vip.createVIPMembership(user, req, res)
      return
    }
  }
  stripe.customers.create({email: user.email}, function (stripeerr, customer) {
    if (stripeerr) {
      helpers.sendErrorResponse(res, 500, 'User could not be created')
      return
    }
    user.customerid = customer.id
    user.save(function (err) {
      if (err) {
        console.log()
        helpers.sendErrorResponse(res, 500, "This email has already been taken.  <a href='#' data-modal='login-modal'>Login</a> if it's yours")
      } else {
        email.sendInitialEmail(user, function () {
          helpers.sendUpdateCookie(res, user, {
            status: 'success',
            coupon: clientCoupon
          })
        })
      }
    })
  })
})

router.post('/login', function (req, res) {
  if (!req.body.email || !req.body.password) {
    helpers.sendErrorResponse(res, 400, 'All fields required')
    return
  }

  passport.authenticate('local', function (err, user, info) {
    if (err) {
      helpers.sendJSONResponse(res, 404, err)
      return
    }

    if (user) {
      helpers.sendUpdateCookie(res, user, {
        status: 'success'
      })
    } else {
      helpers.sendJSONResponse(res, 401, info)
    }
  })(req, res)
})
router.post('/lifetime', [helpers.onlyLoggedIn, helpers.getCoupon], function (req, res) {
  if (!req.body.token) {
    helpers.sendJSONResponse(res, 400, {
      'message': 'All fields required'
    })
    return
  }

  var wasMonthly = false
  if (req.user.isLifetime()) {
    helpers.sendJSONResponse(res, 404, {
      error: 'You are already a lifetime subscriber'
    })
    return
  }
  if (req.user.isMonthly()) {
    // if they are a monthly user than delete their subscription
    stripe.subscriptions.del(req.user.subscriptionid)
    wasMonthly = true
  }
  req.user.token = req.body.token
  var amount = 9900

  if (req.coupon) {
    amount = convertAmountForCoupon(amount, req.coupon)
  }

  stripe.customers.update(req.user.customerid,
    {source: req.body.token}, function (err, customer) {
      if(err){
          helpers.sendErrorResponse(res, 400, "Could not update user");
          return;
      }
      stripe.charges.create({
        amount: amount, // amount in cents
        currency: 'usd',
        description: 'Life Time Access',
        customer: req.user.customerid
      }, function (err, charge) {
        console.log('stripe error: ' + err)
        if (err && err.type === 'StripeCardError') {
          // The card has been declined
          helpers.sendErrorResponse(res, 401, {
            error: 'Card was declined',
            declined: true
          })
          return
        }
        if (err) {
          helpers.sendErrorResponse(res, 401, {
            error: 'Transaction could not be processed',
            declined: true
          })
          return
        }
        req.user.pro = true
        if (charge) { req.user.chargeid = charge.id; }
        req.user.type = 'lifetime'
        req.user.prodate = Date.now()
        req.user.save(function (err) {
          if (err) {
            helpers.sendJSONResponse(res, 404, err)
          } else {
            if (wasMonthly) {
              email.sendUpgradeEmail(user, function () {
                helpers.sendUpdateCookie(res, req.user, {
                  status: 'success'
                })
              })
            } else {
              helpers.sendUpdateCookie(res, req.user, {
                status: 'success'
              })
            }
          }
        })
      })
    })
})
router.post('/monthly', [helpers.onlyLoggedIn, helpers.getCoupon], function (req, res) {
  if (!req.body.token) {
    helpers.sendJSONResponse(res, 400, {
      'message': 'All fields required'
    })
    return
  }

  if (req.user.isMonthly()) {
    helpers.sendErrorResponse(res, 404, 'You are already a monthly subscriber')
    return
  }
  if (req.user.isLifetime()) {
    helpers.sendJSONResponse(res, 404, 'You are already a lifetime subscriber')
    return
  }
  req.user.token = req.body.token
  var customerReq = {
    source: req.user.token,
    plan: 'Monthly',
    email: req.user.email
  }
  if (req.coupon) {
    customerReq.coupon = req.coupon.id
  }
  stripe.customers.create(customerReq, function (err, customer) {
    if (err && err.type === 'StripeCardError') {
      console.error(err)
      // The card has been declined
      // TODO: Stop further execution
      helpers.sendJSONResponse(res, 401, {
        error: 'Card was declined',
        declined: true
      })
      return
    }
    if (err) {
      console.error(err)
      helpers.sendJSONResponse(res, 401, {
        error: 'Error processing payment',
        declined: true
      })
      return
    }
    req.user.pro = true
    req.user.customerid = customer.id,
    req.user.subscriptionid = customer.subscriptions.data[0].id
    req.user.type = 'monthly'
    req.user.prodate = Date.now()
    req.user.save(function (err) {
      if (err) {
        helpers.sendJSONResponse(res, 404, err)
      } else {
        helpers.sendUpdateCookie(res, req.user, {
          status: 'success'
        })
      }
    })
  })
})
router.post('/cancel', helpers.onlyLoggedIn, function (req, res) {
  var user = req.user
  if (!user.isMonthly()) {
    helpers.sendJSONResponse(res, 404, {
      error: 'You are not a monthly subscriber'
    })
    return
  }

  stripe.subscriptions.del(user.subscriptionid, function (error, confirmation) {
    if (!error) {
      user.pro = false
      user.type = undefined
      user.save(function (err) {
        if (err) {
          helpers.sendJSONResponse(res, 404, err)
        } else {
          email.sendCancellationEmail(user, function () {
            helpers.sendUpdateCookie(res, user, {
              status: 'success'
            })
          })
        }
      })
    } else {
      helpers.sendJSONResponse(res, 404, error)
    }
  })
})
router.get('/verifyemail', helpers.onlyLoggedIn, function (req, res) {
  var user = req.user
  email.sendVerifyEmail(user, function () {
    helpers.sendUpdateCookie(res, user, {
      status: 'success'
    })
  })
})
router.post('/email', helpers.onlyLoggedIn, function (req, res) {
  if (!req.body.email) {
    helpers.sendJSONResponse(res, 400, {
      'message': 'All fields required'
    })
    return
  }
  var user = req.user
  user.email = xssFilters.inHTMLData(req.body.email)
  user.email_code = crypto.randomBytes(100).toString('hex')
  user.emailverified = false
  user.save(function (err) {
    if (err) {
      helpers.sendJSONResponse(res, 404, err)
    } else {
      email.sendInitialEmail(user, function () {
        helpers.sendUpdateCookie(res, user, {
          status: 'success'
        })
      })
    }
  })
})
router.post('/password', helpers.onlyLoggedIn, function (req, res) {
  if (!req.body.password) {
    helpers.sendJSONResponse(res, 400, {
      'message': 'All fields required'
    })
    return
  }
  var user = req.user
  user.setPassword(req.body.password)
  user.save(function (err) {
    if (err) {
      helpers.sendJSONResponse(res, 404, err)
    } else {
      helpers.sendUpdateCookie(res, user, {
        status: 'success'
      })
    }
  })
})
router.post('/logout', function (req, res) {
  res.clearCookie('auth')
  helpers.sendJSONResponse(res, 200, {
    status: 'success'
  })
})
router.post('/forgotPassword', function (req, res) {
  if (!req.body.email) {
    helpers.sendJSONResponse(res, 400, {
      'message': 'email required'
    })
    return
  }
  var emailAddr = req.body.email.toLowerCase()
  User
    .findOne({
      email: emailAddr
    })
    .exec(function (err, user) {
      if (!user) {
        helpers.sendJSONResponse(res, 404, {
          'message': 'User not found'
        })
        return
      } else if (err) {
        console.log(err)
        helpers.sendJSONResponse(res, 404, err)
        return
      }
      email.sendPasswordEmail(user, function () {
        helpers.sendJSONResponse(res, 200, {
          status: 'success'
        })
      })
    })
})

module.exports = router

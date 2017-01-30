var mongoose = require('mongoose')
var User = mongoose.model('User')
var stripe = require('stripe')(process.env.STRIPE_KEY);
function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/auth/login')
}
function loggedIn (req, res, next) {
  if (req.payload && req.payload.email) {
    User
      .findOne({
        email: req.payload.email
      })
      .exec(function (err, user) {
        if (user && !err) {
          req.user = user
        }
        else if(req.payload && req.payload.email)
        {
            //they had a valid auth cookie, but no user delete the cookie.
            res.clearCookie('auth')
        }
        return next()
      }
    )
  } else {
    return next()
  }
}
function onlyLoggedIn (req, res, next) {
  if (req.user) {
    return next()
  } else {
    res.status(401).json({
    status: 'error',
    message: 'You must log in first.'
  });

  }
}
function isPro (req) {
  return (req.user && req.user.pro)
}
function ensureAdmin (req, res, next) {
  if (isLoggedIn(req) && req.payload.admin) {
    User
      .findOne({ email: req.payload.email })
      .exec(function (err, user) {
        if (!err && user && user.admin) {
          return next()
        } else {
          res.status(401).json({ status: 'error', message: 'You are not an admin' })
        }
      })
  } else {
    res.status(401).json({ status: 'error', message: 'You are not an admin' })
  }
}
// Gets a coupon code from stripe.
// If the coupon doesn't exists then callback
function getCoupon (req, res, next) {
  // If coupon code is null, then return the null callback
  // case where coupon code is in request
  console.log("Checking Coupon");
  var code = null
  if (req.body.couponcode) {
    code = req.body.couponcode.trim().toUpperCase()
  }
  else if (req.user && req.user.couponcode) {
    code = req.user.couponcode
  }
  if (code) {
    stripe.coupons.retrieve(
      code,
      function (err, coupon) {
        if (!err && coupon) {
          req.coupon = coupon
        }
        return next()
      }
    )
  } else {
    // no coupon that we can apply
    return next();
  }
}
function databaseQueryTimeout (req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    console.error('Testing error here')
    return res.status(500).json({ error: 'query timed out' })
  }
  next()
}
function ensureAdminJSON (req, res, next) {
  if (req.isAuthenticated() && req.user.admin) {
    return next()
  }
  res.status(401)
    .json({
      status: 'error',
      message: 'You do not have permission to do that.'
    })
}

function loginRedirect (req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/')
  } else {
    return next()
  }
}
function getIpAddress (req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
}

var sendErrorResponse = function (res, status, errorMessage) {
  res.status(status)
  res.json({ 'error': errorMessage });
  res.end();
}

var sendJSONResponse = function (res, status, content) {
  res.status(status)
  res.json(content)
}
var sendUpdateCookie = function (res, user, content) {
  setCookie(res, user)
  sendJSONResponse(res, 200, content)
}

var setCookie = function (res, user) {
  token = user.generateJwt()
  res.cookie('auth', token, {
    secure: true,
    maxAge: 604800000
  })
}
module.exports = {
  loggedIn:loggedIn,
  ensureAuthenticated: ensureAuthenticated,
  ensureAdmin: ensureAdmin,
  ensureAdminJSON: ensureAdminJSON,
  loginRedirect: loginRedirect,
  onlyLoggedIn: onlyLoggedIn,
  isPro: isPro,
  databaseQueryTimeout: databaseQueryTimeout,
  getIpAddress: getIpAddress,
  sendErrorResponse: sendErrorResponse,
  sendJSONResponse: sendJSONResponse,
  sendUpdateCookie: sendUpdateCookie,
  setCookie: setCookie,
  getCoupon:getCoupon
}

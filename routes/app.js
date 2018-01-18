var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Lines = mongoose.model('Line')
var Users = mongoose.model('User')
var path = require('path')
var helpers = require('./helpers')
var xssFilters = require('xss-filters')
/* GET home page. */

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../public', 'app.html'))
})

router.get('/data/:audience/:profanity', helpers.databaseQueryTimeout, function (req, res) {
  query = {}
  switch (Number(req.params.audience)) {
    case 0:
      query = {
        men: true
      }
      break
    case 1:
      query = {
        women: true
      }
      break
    case 2:
      query = {
        kids: true
      }
      break
    case 3:
      query = {
        couples: true
      }
      break
    case 4:
      query = {
        groups: true
      }
      break
  }
  var profanityOn = JSON.parse(req.params.profanity)
  if (profanityOn) {
    query = {
      $or: [query, {
        profanity: profanityOn
      }]
    }
  } else {
    query.profanity = false
  }
  // only show approved
  query.approved = true

  // only show free to non-pro users
  if (!helpers.isPro(req)) {query.free = true;}

  console.log('/data/lines query:' + query)
  Lines.find(query, function (err, results) {
    res.json(results)
  })
})
router.post('/add', helpers.onlyLoggedIn, function (req, res) {
  var line = req.body

  line.ipaddress = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress
  // Check to see if user has been banned

  var user = req.user
  if (user.banned) {
    console.error('Banned User tried to create record')
    sendJSONresponse(res, 403, {
      message: 'You have been banned from submitting lines'
    })
    return
  }
  if (!user.emailverified) {
    console.error('Unverified user has attempted to add line')
    sendJSONresponse(res, 401, {
      message: 'You have not verified your email'
    })
    return
  }

  // filter out any XSS data
  line.line = xssFilters.inHTMLData(line.line)
  line.author = user.name
  line.authorid = user._id
  // create the line
  Lines.create(line,
    function (err, result) {
      console.log('err:' + err)
      console.log('result:' + result)
      sendJSONresponse(res, 200, result)
    })
})
// not currently doing line voting functionality
/*router.get('/rate/:lineid/:vote', function (req, res) {
    console.log("vote called")
    Lines.findById(req.params.lineid).exec(function (err, line) {
        if (req.params.vote === "true") line.rating++
        else line.rating--
        line.save(function (err, line) {
            sendJSONresponse(res, 200, line)
        })
    })
})
*/
var sendJSONresponse = function (res, status, content) {
  res.status(status)
  res.json(content)
}

module.exports = router

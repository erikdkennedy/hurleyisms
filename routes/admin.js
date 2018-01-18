var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var lines = mongoose.model('Line')
var users = mongoose.model('User')
var path = require('path')
var helpers = require('./helpers')
var vip = require('./vip')

router.get('/', helpers.ensureAdmin, function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public', 'admin.html'))
})
router.get('/data', helpers.ensureAdmin, function (req, res) {
  lines.find({ approved: false }).sort({ dateadded: -1 }).exec(function (err, allLines) {
    console.log(err)
    res.json(allLines)
  })
})
router.get('/:id/approve', helpers.ensureAdmin, function (req, res) {
  var id = req.params.id
  lines.findByIdAndUpdate(id, { $set: { approved: true } }, function (err, line) {
    sendJSONresponse(res, 200, line)
  })
})
router.get('/:id/delete', helpers.ensureAdmin, function (req, res) {
  var id = req.params.id
  lines.findByIdAndRemove(id, function () {
    sendJSONresponse(res, 200, { status: 'success' })
  })
})
router.post('/ban', helpers.ensureAdmin, function (req, res) {
  var line = req.body
  users.findByIdAndUpdate(line.authorid, { $set: { banned: true } }, function () {
    lines.remove({ authorid: line.authorid }, function (err) {
      sendJSONresponse(res, 200, { status: 'success' })
    })
  })
})
router.post('/update', helpers.ensureAdmin, function (req, res) {
  var line = req.body
  var id = line._id
  // strip the ID and v
  delete line._id
  delete line.v
  line.line = modifyline(line.line)
  lines.findByIdAndUpdate(id, { $set: line }, function (err, line) {
    sendJSONresponse(res, 200, line)
  })
})

router.post('/:id/updatetext', helpers.ensureAdmin, function (req, res) {
  if (!req.body.text || !req.params.id) {
    sendJSONresponse(res, 400, {
      'message': 'All fields required'
    })
    return
  }

  var text = req.body.text
  var id = req.params.id

  text = modifyline(text)
  lines.findByIdAndUpdate(id, { $set: { line: text } }, function (err, line) {
    sendJSONresponse(res, 200, line)
  })
})
router.post('/makevip', helpers.ensureAdmin, function (req, res) {
  if (!req.body.email) {
    sendJSONresponse(res, 400, {
      'message': 'All fields required'
    })
    return
  }
  users
    .findOne({
      email: req.body.email
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
      user.couponcode = '5DAYDEAL'
      vip.createVIPMembership(user, req, res)
    })
})
var modifyline = function (line) {
  if (line.indexOf(']') > -1 && line.indexOf(']') > -1) {
    line = line.replace('[', '<br/><I>-')
    line = line.replace(']', '</I>')
  }
  return line
}
var sendJSONresponse = function (res, status, content) {
  res.status(status)
  res.json(content)
}
module.exports = router

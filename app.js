var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('./models/db');
require('./config/passport');
var routes = require('./routes/index');
var admin = require('./routes/admin');
var appRoute = require('./routes/app');
var authRoute = require('./routes/auth');
var passport = require('passport');
var uglifyJs = require("uglify-js");
var jwt = require('express-jwt');
var fs = require('fs');
var BasicStrategy = require('passport-http').BasicStrategy
var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
function minJSFiles(files, target)
{
    var uglified = uglifyJs.minify(files, { compress: false, mangle: false });
    fs.writeFile(target, uglified.code, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Script generated and saved:", target);
        }
    });
}

//combine JS for SPA
var appClientFiles = [
  'public/javascripts/shared.js',
  'public/javascripts/app.js'
];
minJSFiles(appClientFiles, 'public/javascripts/hurleyisms.min.js');

var proClientFiles = [
    'public/javascripts/shared.js',
    'public/javascripts/stripe.js',
    'public/javascripts/auth.js'
]
minJSFiles(proClientFiles, 'public/javascripts/pro.min.js');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

//setup auth cookie checking

app.use(jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: function fromCookie(req)
    {
        console.log("checking cookie");
        if(req.cookies.auth) return req.cookies.auth;
        return null;
    }
}));


// ROUTING SECTION
app.use('/', routes);
app.use('/app', appRoute);
app.use('/admin', admin);
app.use('/auth', authRoute );
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


passport.use(new BasicStrategy(
  function(userid, password, done) {
    console.log(userid);
    console.log(password);
    if (userid === process.env.ADMINUSER && password === process.env.ADMINPASSWORD) {
        console.log("password verified");
        return done(null, { name: "hurley" });
    }
    else {
        console.log("password rejected");
        return done(null, false);
    }
  }
));


module.exports = app;

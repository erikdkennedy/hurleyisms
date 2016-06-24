var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('./models/db');
var routes = require('./routes/index');
var admin = require('./routes/admin');
var users = require('./routes/users');
var appRoute = require('./routes/app');
var passport = require('passport');
var uglifyJs = require("uglify-js");
var fs = require('fs');
var BasicStrategy = require('passport-http').BasicStrategy
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//combine JS for SPA
var appClientFiles = [
  'public/javascripts/shared.js',
  'public/javascripts/app.js'
];
var compressFlag = process.env.ENVIRONMENT == 'prod' || false ;
console.log(compressFlag + "- compressFlag");
var uglified = uglifyJs.minify(appClientFiles, { compress: compressFlag, mangle:compressFlag });

fs.writeFile('public/javascripts/hurleyisms.min.js', uglified.code, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Script generated and saved:", 'hurleyisms.min.js');
    }
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

// ROUTING SECTION
app.use('/', routes);
app.use('/app', appRoute);
app.use('/admin', admin);
app.use('/users', users);

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

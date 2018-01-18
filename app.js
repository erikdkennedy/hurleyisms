/// <reference path="public/javascripts/pro.js" />
if(!process.env.NODE_ENV){
    console.log("loading .env");
require('dotenv').config();
}
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('./models/db');
require('./config/passport');
require('./config/generatejs');
var routes = require('./routes/index');
var admin = require('./routes/admin');
var appRoute = require('./routes/app');
var authRoute = require('./routes/auth');
var mailRoute = require('./routes/mail');
var webhookRoute = require('./routes/webhooks');
var passport = require('passport');
var jwt = require('express-jwt');

var app = express();
var helpers = require('./routes/helpers')


var filterLog = function (req) {
    return req.originalUrl.startsWith("/images")
          || req.originalUrl.startsWith("/javascripts")
          || req.originalUrl.startsWith("/stylesheets")
}
//Logging Information
var winston = require('winston');
require('winston-loggly-bulk');
expressWinston = require('express-winston');
winston.add(winston.transports.Loggly, {
    token: "87424c34-9a93-4eeb-b10b-a23adb4e8e6e",
    subdomain: "LimeyJohnson",
    tags: [process.env.WINSTON_TAG],
    json: true
});

app.use(expressWinston.logger({
    transports: [
     new winston.transports.Console({
         json: true,
         colorize: true
     }),
     new winston.transports.Loggly({
         subdomain: 'limeyjohnson',
         inputToken: '87424c34-9a93-4eeb-b10b-a23adb4e8e6e',
         json: true,
         tags: [process.env.WINSTON_TAG]
     })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true) 
    msg: "HTTP StatusCode={{res.statusCode}} Method={{req.method}} {{res.responseTime}}ms URL={{req.url}} LoggedIn={{req.payload != null}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}" 
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true 
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red). 
    ignoreRoute: function (req, res) { return filterLog(req); }, // optional: allows to skip some log messages based on request and/or response 
    dynamicMeta: function (req,res) { 
        if(req.user) {
            return {user: req.user.email, pro:req.user.pro, loggedin:true, type:req.user.type}} 
            return {loggedin:false}
        },
    requestFilter: function (req, propName) { if(propName === "headers") {return undefined;} return req[propName]  } 
}));


// Ensure the page is secure. Since AWS forwards to non-http we need to check request headers
var forceHttps = function (req, res, next) {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https' || req.headers['x-arr-ssl']) {
        next();
    } else {
        console.log('Request made over HTTP, redirecting to HTTPS '+req.hostname);
        
        res.redirect('https://' + req.hostname);
    }
};
app.use(forceHttps);
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
//Only log error responses
app.use(logger('combined', {
    skip: function (req, res) {
        return req.originalUrl.startsWith("/images")
       || req.originalUrl.startsWith("/javascripts")
       || req.originalUrl.startsWith("/stylesheets")
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
//app.use(passport.session());

//setup auth cookie checking

app.use(jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: function fromCookie(req) {
        if (req.cookies.auth) { return req.cookies.auth; }
        return null;
    }
}));
app.use(helpers.loggedIn);

// ROUTING SECTION
app.use('/', routes);
app.use('/app', appRoute);
app.use('/admin', admin);
app.use('/auth', authRoute);
app.use('/email', mailRoute);
app.use('/webhooks', webhookRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if(process.env.NODE_ENV === 'development') {
    app.use(function (err, req, res, next) {
        console.error(err);
        res.status(err.status || 500)
            .send({
                message: err.message,
                error: err
            });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log("in prod error handler");
    res.status(err.status || 500)
        .send({
            message: err.message,
            error: {}
        });
});
module.exports = app;

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
var routes = require('./routes/index');
var admin = require('./routes/admin');
var appRoute = require('./routes/app');
var authRoute = require('./routes/auth');
var mailRoute = require('./routes/mail');
var webhookRoute = require('./routes/webhooks');
var passport = require('passport');
var uglifyJs = require("uglify-js");
var jwt = require('express-jwt');
var fs = require('fs');
var app = express();
var sass = require('node-sass');


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
    meta: false, // optional: control whether you want to log the meta data about the request (default to true) 
    msg: "HTTP StatusCode={{res.statusCode}} Method={{req.method}} {{res.responseTime}}ms URL={{req.url}} LoggedIn={{req.payload != null}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}" 
    expressFormat: false, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true 
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red). 
    ignoreRoute: function (req, res) { return filterLog(req); } // optional: allows to skip some log messages based on request and/or response 
}));


function minJSFiles(files, target) {
    var beautify = process.env.NODE_ENV === 'development';
    try {
        var uglified = uglifyJs.minify(files, { compress: false, mangle: false, output: { beautify: beautify } });

        fs.writeFile(target, uglified.code, function (err) {
            if (err) {
                console.log("error found");
                console.log(err);
            } else {
                console.log("Script generated and saved:", target);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}
function writeJSFiles() {
    //combine JS for SPA
    var appClientFiles = [
      'public/javascripts/auth.js',
      'public/javascripts/shared.js',
      'public/javascripts/app.js'

    ];
    minJSFiles(appClientFiles, 'public/javascripts/hurleyisms.min.js');

    var proClientFiles = [
        'public/javascripts/config.min.js',
        'public/javascripts/auth.js',
        'public/javascripts/shared.js',
        'public/javascripts/stripe.js',
        'public/javascripts/pro.js'
    ];
    minJSFiles(proClientFiles, 'public/javascripts/pro.min.js');

    var indexClientFiles = [
        'public/javascripts/auth.js',
        'public/javascripts/shared.js',
        'public/javascripts/marketing.js'
    ];
    minJSFiles(indexClientFiles, 'public/javascripts/index.min.js');

    var myAccountClientFiles = [
      'public/javascripts/config.min.js',
      'public/javascripts/auth.js',
      'public/javascripts/shared.js',
      'public/javascripts/stripe.js',
      'public/javascripts/my-account.js'
    ];
    minJSFiles(myAccountClientFiles, 'public/javascripts/myaccount.min.js');
}
//Create Configuration Javascript
var configJsonString = require("./routes/configuration").getConfig();
fs.writeFile('public/javascripts/config.min.js', configJsonString, function (err) {
    if (err) {
        console.log(err);
    }
    writeJSFiles();
});

sass.render({
    file: 'public/stylesheets/styles.scss'
}, function (error, result) { // node-style callback from v3.0.0 onwards
    if (!error) {
        // No errors during the compilation, write this result on the disk
        fs.writeFile('public/stylesheets/styles.css', result.css, function (err) {
            if (!err) {
                console.log("styles.css written on disk");
            }
            else {
                console.error(err);
            }
        });
    }
    else {
        console.error(error);
    }
});


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

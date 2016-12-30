var mongoose = require('mongoose');
var User = mongoose.model('User');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}
function isLoggedIn(req) {
    return req.payload && req.payload.email;
}
function onlyLoggedIn(req, res, next) {
    if (isLoggedIn(req)) {
        return next();
    }
    res.status(401).json({
        status: 'error',
        message: 'You must log in first.'
    });
}
function isPro(req) {
    return isLoggedIn(req) && req.payload.pro;
}
function ensureAdmin(req, res, next) {
    if (isLoggedIn(req) && req.payload.admin) {
        User
        .findOne({ email: req.payload.email })
        .exec(function (err, user) {
            if (!err && user && user.admin ) {
                return next();
            }
            else {
                res.status(401).json({ status: 'error', message: 'You are not an admin' });
            }
        });
    }
    else{
                res.status(401).json({ status: 'error', message: 'You are not an admin' });
            }
            
    
}
function databaseQueryTimeout(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    console.error("Testing error here");
    return res.status(500).json({error: "query timed out"});
  }
  next();
}
function ensureAdminJSON(req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        return next();
    }
    res.status(401)
    .json({
        status: 'error',
        message: 'You do not have permission to do that.'
    });
}

function loginRedirect(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        return next();
    }
}
function getIpAddress(req){
    return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
}


var sendErrorResponse = function(res,status,errorMessage)
{
    res.status(status);
    res.json({"error": errorMessage});
}

var sendJSONResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
var sendUpdateCookie = function (res, user, content) {
    setCookie(res, user);
    sendJSONResponse(res, 200, content);
};

var setCookie = function (res, user) {
    token = user.generateJwt();
    res.cookie('auth', token, {
        secure: true,
        maxAge: 604800000
    });
};
module.exports = {
    ensureAuthenticated: ensureAuthenticated,
    ensureAdmin: ensureAdmin,
    ensureAdminJSON: ensureAdminJSON,
    loginRedirect: loginRedirect,
    isLoggedIn: isLoggedIn,
    onlyLoggedIn: onlyLoggedIn,
    isPro: isPro,
    databaseQueryTimeout:databaseQueryTimeout,
    getIpAddress:getIpAddress,
    sendErrorResponse:sendErrorResponse,
    sendJSONResponse:sendJSONResponse,
    sendUpdateCookie:sendUpdateCookie,
    setCookie:setCookie
};
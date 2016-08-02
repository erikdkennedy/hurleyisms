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
    console.log("is Pro: "+ (isLoggedIn(req) && req.payload.pro))
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


module.exports = {
    ensureAuthenticated: ensureAuthenticated,
    ensureAdmin: ensureAdmin,
    ensureAdminJSON: ensureAdminJSON,
    loginRedirect: loginRedirect,
    isLoggedIn: isLoggedIn,
    onlyLoggedIn: onlyLoggedIn,
    isPro: isPro,
    onlyEmailVerified: onlyEmailVerified
};
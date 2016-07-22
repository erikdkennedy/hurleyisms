var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    hash: String,
    salt: String,
    joined: { type: Date, "default": Date.now },
    prodate: { type: Date},
    token: String,
    pro: Boolean,
    customerid: String,
    subscriptionid: String,
    chargeid: String,
    type: String,
    emailverified: { type:Boolean, require:true, "default": false},
    admin: { type: Boolean, "default": false }
});

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.isMonthly = function()
{
    return this.type === "monthly" && this.subscriptionid && this.pro
}

userSchema.methods.isLifetime = function () {
    return this.type === "lifetime" && this.pro
}

userSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        pro: this.pro,
        prodate: this.prodate,
        admin: this.admin,
        type: this.type,
        emailverified: this.emailverified,
        exp: parseInt(expiry.getTime() / 1000),
    }, process.env.JWT_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

userSchema.methods.verificationCode = function () {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 40);

    return jwt.sign({
        _id: this._id,
        email: this.email,
    }, process.env.JWT_SECRET);
}

var model = mongoose.model('User', userSchema);
model.schema.options.emitIndexErrors;
model.on('error', function (error) {
    console.error(error);
});

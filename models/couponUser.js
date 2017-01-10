    require('dotenv').config();
require('./db.js');
var mongoose = require('mongoose');
var userModel = mongoose.model('User');
userModel.remove({}, function (err, count) {
    console.log("removed " + count + " users ");
    var user = new userModel({
        hash: "eb50ce6f00719100af3db38717da4cec9fc4653eb94cac4bfa4589868e87a527409e0baa153df576747f7a1df5880825fbc36b4dfc32facc50d3e7cb84a7d651",
        salt: "107f646e7defd5d203afb838d2bc9306",
        signupip: "::1",
        email: "limeyjohnson@gmail.com",
        name: "Andrew Johnson",
        banned: false,
        admin: false,
        emailverified: false,
        joined: "12/01/2016 06:14:45 AM (-0800)",
        __v: 0,
        customerid: "cus_9fFqBk3jpPHxRZ",
        pro: true,
        prodate: "01/06/2017 06:15:02 AM (-0800)",
        subscriptionid: "sub_9fFqpa36qSxGKa",
        token: "tok_19LvKyJKWqhH9miDaBziwTMo",
        type: "lifetime",
        couponcode:"HeadShotCrew75"
       })
    user.save(function () {
        if (err) {
            console.log("error creating mongo user");
            sendJSONresponse(res, 404, err);
        }
        process.exit();
    });
});
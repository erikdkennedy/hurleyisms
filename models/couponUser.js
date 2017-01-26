    require('dotenv').config();
require('./db.js');
var mongoose = require('mongoose');
var userModel = mongoose.model('User');
userModel.remove({}, function (err, count) {
    console.log("removed " + count + " users ");
    
    users = [
        {
    "hash" : "f60d1d5c9a25e32716189cb2c0cf795f17ee6099358834d5c63855caa7edc4cc1edbf8a3cb0eff1dc9285f23c727cf5ddb4b16a1eb0dbc28ff4c08cc679f01d9",
    "salt" : "527892dbe2e98ff0e5c9d3aa56d9fdf1",
    "signupip" : "75.134.225.153, 172.31.18.0",
    "email" : "andrew@limeyjohnson.com",
    "name" : "Yvon J N",
    "banned" : false,
    "admin" : false,
    "emailverified" : true,
    "joined" : "2017-01-23T17:31:21.233Z"
       },
       {
    
   
    
    "hash" : "33f147818983bec78df6635ff7bb20fcf41f38aeb9ac075a3dbaf7a41b5088cb4a47b7a5cedacaccd487cbb06ef5d113d51435377157f3e75d3d9602841991f0",
    "salt" : "0cc76b9d12bc771b58ad078619cd190b",
    "signupip" : "::1",
    "email" : "limeyjohnson@gmail.com",
    "name" : "Andrew Johnson",
    "banned" : false,
    "admin" : true,
    "emailverified" : false,
    "joined" : "2017-01-26T14:06:42.844Z",
    "chargeid" : "ch_19gDtsJKWqhH9miDdQYX7h3f",
    "pro" : true,
    "prodate" : "2017-01-26T14:06:56.951Z",
    "token" : "tok_19gDtpJKWqhH9miD4uMQgTyV",
    "type" : "lifetime"

    }
    ];
    usersave = 0;
    console.log(users);
    users.forEach(function(userJson){
    
        console.log(userJson);
        userModel(userJson).save(function () {
        if (err) {
            console.log("error creating mongo user");
        }
        
        
    });
    });
    
});
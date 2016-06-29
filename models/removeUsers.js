require('./db.js');
var mongoose = require('mongoose');
var userModel = mongoose.model('User');
userModel.remove({}, function(err, count){
    console.log("removed "+count+" users ");
    process.exit();
});
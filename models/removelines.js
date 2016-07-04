require('./db.js');
var mongoose = require('mongoose');
var lineModel = mongoose.model('Line');
lineModel.remove({ ipaddress:"4.2.2.1" }, function(err, count){
	console.log("removed "+count+" lines ");
	process.exit();
});
require('./db.js');
var mongoose = require('mongoose');
var lineModel = mongoose.model('Line');
lineModel.remove({}, function(err, count){
	console.log("removed "+count+" lines ");
	process.exit();
});
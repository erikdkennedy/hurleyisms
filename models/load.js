//Script to load the default lines;
require('./db.js');
var mongoose = require('mongoose');
var lineModel = mongoose.model('Line');

var cachedLines = [];

var fs = require('fs');
var readline = require('readline');

var filename = 'models/hurleyisms.tsv';
readline.createInterface({
    input: fs.createReadStream(filename),
    terminal: false
}).on('line', function(lineText) {
   console.log(lineText);
    var parts = lineText.split("\t");
    console.log(parts.length)
    if(parts.length>=7){
	    line.line = parts[1];
	    line.men = parts[2].indexOf("X") > -1;
	    line.women = parts[3].indexOf("X") > -1;
	    line.kids = parts[4].indexOf("X") > -1;
	    line.profanity = parts[5].indexOf("X") > -1;
	    line.author = parts[6];
	}
	console.log(parts);
});

lineModel.create(cachedLines, function (err, result) {
    console.log("Added Lines ");
    process.exit();
});


//Script to load the default lines;
require('./db.js');
var mongoose = require('mongoose');
var lineModel = mongoose.model('Line');
const readline = require('readline');
const fs = require('fs');
cachedLines = [];
const rl = readline.createInterface({
    input: fs.createReadStream("models/hurleyisms.tsv")
});
function modifyline(line)
{
	if(line.indexOf("]") > -1 && line.indexOf("]") > -1)
	{
	console.log(line);
	line = line.replace("[", "<br/><I>-");
	line = line.replace("]", "</I>");
	console.log(line);
	}
	return line;
}
rl.on('line', function (lineText) {
    var parts = lineText.split("\t");
    if (parts.length >= 1 && !isNaN(parseFloat(parts[0]))) {
    	//console.log(lineText);
    	//console.log(parts.length)
        line = {};
        line.line = modifyline(parts[1]);
        line.men = parts[2].indexOf("X") > -1;
        line.women = parts[3].indexOf("X") > -1;
        line.kids = parts[4].indexOf("X") > -1;
        line.profanity = parts[5].indexOf("X") > -1;
        line.author = parts[6];
        line.ipaddress = "4.2.2.1";
        line.approved = true;
        cachedLines.push(line);
    }
});

rl.on('close', function () {
    console.log("Adding "+cachedLines.length+" lines")
    lineModel.create(cachedLines, function (err, result) {
        console.log("Added Lines ");
        console.log(err);
        process.exit();
    });
});





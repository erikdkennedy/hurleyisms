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

rl.on('line', function (lineText) {
    var parts = lineText.split("\t");
    if (parts.length >= 21) {
        line = {};
        line.line = parts[0];
        line.men = parts[1].indexOf("X") > -1;
        line.women = parts[2].indexOf("X") > -1;
        line.kids = parts[3].indexOf("X") > -1;
        line.profanity = parts[4].indexOf("X") > -1;
        line.author = parts[5];
        cachedLines.push(line);
    }
});

rl.on('close', function () {
    console.log("Adding "+len(cachedLines)+" lines")
    lineModel.create(cachedLines, function (err, result) {
        console.log("Added Lines ");
        process.exit();
    });
});




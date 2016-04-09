//Script to load the default lines;
require('./db.js');
var mongoose = require('mongoose');
var lineModel = mongoose.model('Line');

var cachedLines = [
		{
		    id: 0,
		    line: "Flare your right nostril...<br/><br/>Wait, you did both.  Just the right one.",
		    men: true,
		    women: true,
		    kids: true,
		    profanity: false,
		    rating: 0,
		    author: "Peter Hurley"
		},
		{
		    id: 1,
		    line: "Don't get ahead of yourself– you'll get ahead of me!",
		    men: true,
		    women: true,
		    kids: true,
		    profanity: false,
		    rating: 0,
		    author: "Peter Hurley"
		},
		{
		    id: 2,
		    line: "Look like you WON the marathon.<br/><br/>Now look like you LOST the marathon.",
		    men: true,
		    women: true,
		    kids: false,
		    profanity: false,
		    rating: 0,
		    author: "Peter Hurley"
		},
		{
		    id: 3,
		    line: "Think like a pedestrian!",
		    men: true,
		    women: true,
		    kids: false,
		    profanity: false,
		    rating: 0,
		    author: "Peter Hurley"
		},
		{
		    id: 4,
		    line: "Look like you're operating from a different train of thought!",
		    men: true,
		    women: true,
		    kids: false,
		    profanity: false,
		    rating: 0,
		    author: "Peter Hurley"
		},
		{
		    id: 5,
		    line: "TWILCH to the left!...<br/><br/>Ahh, so THAT'S what a twilch is!",
		    men: true,
		    women: true,
		    kids: true,
		    profanity: false,
		    rating: 0,
		    author: "Peter Hurley"
		},
		{
		    id: 6,
		    line: "Smirch up a bit.  That's the PERFECT amount of smirch!<br/><br/>Now DOUBLE the smirch.  Ahh, smirchfection!",
		    men: true,
		    women: true,
		    kids: true,
		    profanity: false,
		    rating: 0,
		    author: "Peter Hurley"
		},
		{
		    id: 7,
		    line: "Forehead UP, chin DOWN, forehead UP, chin DOWN...<br/><br/>Why are you nodding?",
		    men: true,
		    women: true,
		    kids: true,
		    profanity: false,
		    rating: 0,
		    author: "Peter Hurley"
		},
];

lineModel.create(cachedLines, function (err, result) {
    console.log("Added Lines ");
    process.exit();
});


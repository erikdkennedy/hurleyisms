var mongoose = require('mongoose');
var lineSchema = new mongoose.Schema(
{
    line: { type: String, required: true },
    men: { type: Boolean, require: true },
    women: { type: Boolean, require: true },
    kids: { type: Boolean, require: true },
    couples: { type: Boolean, require: true },
    groups: { type: Boolean, require: true },
    profanity: { type: Boolean, require: true },
    rating: { type: Number, "default": 0 },
    author: { type: String, require: true },
    //The author text is required, but the author ID is not
    //lines with no author id are the pre-loaded lines
    authorid: String,
    dateadded: { type: Date, "default": Date.now },
    ipaddress: { type: String, "default": "" },
    approved: { type: Boolean, required: true, "default": false },
    free: {type: Boolean, required: true, "default": false}
});
mongoose.model('Line', lineSchema);

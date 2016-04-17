var mongoose = require('mongoose');
var lineSchema = new mongoose.Schema(
{
    line: { type: String, required: true },
    men: { type: Boolean, require: true },
    women: { type: Boolean, require: true },
    kids: { type: Boolean, require: true },
    profanity: { type: Boolean, require: true },
    rating: { type: Number, "default": 0 },
    author: String,
    dateadded: { type: Date, "default": Date.now },
    ipaddress: { type: String, "default": "" },
    approved:{type:Boolean, required: true, "default":false}
});
mongoose.model('Line', lineSchema);

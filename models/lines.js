var mongoose = require('mongoose');
var lineSchema = new mongoose.Schema(
{
    line: { type: String, required: true },
    men: Boolean,
    women: Boolean,
    kids: Boolean,
    profanity: Boolean,
    rating: { type: Number, "default": 0 },
    author: {type: String, required:true}
});
console.log("defining schema");
mongoose.model('Line', lineSchema);

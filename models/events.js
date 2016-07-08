var mongoose = require('mongoose');
var eventSchema = new mongoose.Schema(
{
    //event_id: { type: String, required: true },
    received: { type: Date, "default": Date.now },
    event: {}
});
mongoose.model('events', eventSchema);
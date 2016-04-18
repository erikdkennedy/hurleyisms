var mongoose = require('mongoose');
var banSchema = new mongoose.Schema(
{
    ipaddress: { type: String, required: true }
});
mongoose.model('Banlist', banSchema);
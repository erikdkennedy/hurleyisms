//ONLY FOR PUBLIC CONFIGURATION VARIABLES

var template = "var configuration = (function () {" +
    "var config = {CONFIG};" +
    "return config;" +
    "}());";

var getConfig = function () {
    var config = {};
    config.stripe_pk = process.env.STRIPE_PUBLIC_KEY;
    return template.replace("{CONFIG}", JSON.stringify(config));
}

module.exports = {
    getConfig: getConfig
};
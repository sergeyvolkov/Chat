var mongoose = require('mongoose'),
    session = require('express-sessions'),
    mongoStore = require('connect-mongo')(session),
    sessionStore;

console.log(mongoStore); return;

sessionStore = new MongoStore({mongoose_connection: mongoose.connection});

module.exports = sessionStore;


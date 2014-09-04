var mongoose = require('mongoose'),
    express = require('express'),
    mongoStore = require('connect-mongo')(express),
    sessionStore;

sessionStore = new MongoStore({mongoose_connection: mongoose.connection});

module.exports = sessionStore;


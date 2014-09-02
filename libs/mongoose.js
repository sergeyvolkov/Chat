var mongoose    = require('mongoose'),
    config      = require('configs');

mongoose.connect(
    config.get('mongoose:url'),
    config.get('mongoose:options')
);

module.exports = mongoose;
var mongoose    = require('libs/mongoose'),
    bcrypt      = require('bcrypt-nodejs'),
    schema;

schema = new mongoose.Schema({
    local: {
        login       : String,
        password    : String
    }
});

schema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

exports.User = mongoose.model('User', schema);

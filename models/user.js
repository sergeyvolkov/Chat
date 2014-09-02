var mongoose    = require('libs/mongoose'),
    bcrypt      = require('bcrypt-nodejs'),
    schema;

schema = new mongoose.Schema({
    username    : String,
    password    : String
});

schema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.methods.validPassword = function(password) {
    // @todo: add bcrypt compare after sign up implementing
    return this.password == password;
//    return bcrypt.compareSync(password, this.password);
};

exports.User = mongoose.model('User', schema);

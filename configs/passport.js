var LocalStrategy   =   require('passport-local').Strategy,
    User            =   require('../models/user').User;

module.exports = function(passport) {

    passport.serializeUser(function(user, callback) {
        callback(null, user.id);
    });
    passport.deserializeUser(function(id, callback) {
        User.findById(id, function(err, user) {
            callback(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        _usernameField:     'login',
        _passwordField:     'password',
        _passReqToCallback: true
    },
    function(req, login, password, callback) {
        process.nextTick(function() {
            User.findOne({'local.login': login}, function(err, user) {
                var newUser;

                if (err) {
                    return callback(err);
                }

                if (user) {
                    return callback(null, false, req.flash('signupMessage', 'User with current login already registered'));
                } else {
                    newUser = new User();
                    newUser.local.email     =   email;
                    newUser.local.password  =   newUser.generateHash(password);

                    newUser.save(function(err) {
                        if (err) {
                            throw err;
                        }

                        return callback(null, newUser);
                    });
                }
            });
        });
    }));
};

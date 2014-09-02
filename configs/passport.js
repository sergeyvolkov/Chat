var LocalStrategy   =   require('passport-local').Strategy,
    User            =   require('../models/user').User;

module.exports = function(passport) {
    passport.use('local-login', new LocalStrategy({
            usernameField : 'login',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, login, password, done) {

            User.findOne({ 'username' :  login }, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                console.log('User login: ' + user.username);
                return done(null, user);
            });

        }));


    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};
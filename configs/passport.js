var LocalStrategy   =   require('passport-local').Strategy,
    User            =   require('../models/user').User;

module.exports = function(passport) {
    //passport.use('local-login', new LocalStrategy({
    //        usernameField : 'login',
    //        passwordField : 'password',
    //        passReqToCallback : true
    //    },
    //    function(req, login, password, done) {
    //
    //        User.findOne({ 'username' :  login }, function(err, user) {
    //            if (err) {
    //                return done(err);
    //            }
    //
    //            if (!user)
    //                return done(null, false, req.flash('loginMessage', 'No user found.'));
    //
    //            if (!user.validPassword(password))
    //                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
    //
    //            console.log('User login: ' + user.username);
    //            return done(null, user);
    //        });
    //
    //    }));

    passport.use('local', new LocalStrategy({
            usernameField : 'login',
            passwordField : 'password',
            passReqToCallback : false
        },
        function(username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false);
                }
                if (!user.validPassword(password)) {
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ));

    passport.use('local-signup', new LocalStrategy({
            usernameField       :   'login',
            passwordField       :   'password',
            passReqToCallback   :   true
        },
        function(req, login, password, callback) {
            process.nextTick(function() {
                User.findOne({'username': login}, function(err, user) {
                    var newUser;

                    if (err) {
                        return callback(err);
                    }

                    if (user) {
                        return callback(
                            null,
                            false,
                            req.flash('signupMessage', 'User with current login already registered')
                        );
                    } else {
                        newUser = new User();
                        newUser.username    =   login;
                        newUser.password    =   newUser.generateHash(password);

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


    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};
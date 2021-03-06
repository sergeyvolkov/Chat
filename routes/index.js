module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        res.render('index', {title: "Chat"});
    });

    app.get('/login', function(req, res) {
        res.render('login', { message: req.flash('loginMessage') });
    });
    app.post('/login',
        passport.authenticate('local', {failureFlash: false}),
        function(req, res) {
            res.redirect('/chat');
        }
    );

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
        app.locals.user = null;
    });

    app.get('/sign-up', function(req, res) {
        res.render('../views/signup', { message: req.flash('signupMessage') });
    });
    app.post('/sign-up', passport.authenticate('local-signup', {
        successRedirect:    '/chat',
        failureRedirect:    '/sign-up',
        failureFlash:       true
    }));

    app.get('/chat', function(req, res) {
        if (req.user) {
            app.locals.user = req.user;
        } else {
            res.redirect('/login');
        }

        res.render('chat', {title: "Chat room"});
    });
};

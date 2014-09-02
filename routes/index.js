module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        res.render('index', {title: "Chat"});
    });

    app.get('/login', function(req, res) {
        res.render('login');
    });
    app.post('/login',
        passport.authenticate('local-login', {
            successRedirect :   '/chat',
            failureRedirect :   '/login',
            failureFlash    :   'Invalid credentials'
        })
    );

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/chat', function(req, res) {
        res.render('chat', {title: "Chat room"});
    });
};

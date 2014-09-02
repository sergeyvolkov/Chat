module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        res.render('../views/index.hbs');
    });

    app.get('/sign-up', function(req, res) {
        res.render('../views/signup.hbs');
    });
    app.post('/sign-up', passport.authenticate('local-signup', {
        successRedirect:    '/profile',
        failureRedirect:    '/sign-up',
        failureFlash:       'OOOPS'
    }));
};
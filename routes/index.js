module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index', {title: "Chat"});
    });

    app.get('/login', function(req, res) {
        res.render('login');
    });
    app.post('/login', function(req, res) {
        console.log(req.body.login);
        console.log(req.body.password);
    });

    app.get('/chat', function(req, res) {
        res.render('chat', {title: "Chat room"});
    });
};

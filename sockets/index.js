module.exports = function(server) {
    var io = require('socket.io').listen(server);
    io.set('origins', 'localhost:*');

};
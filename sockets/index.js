module.exports = function(server) {
    var io = require('socket.io').listen(server);
    io.set('origins', 'localhost:*');

    io.set('authorization', function(handshake, callback) {

    });

    io.on('connection', function(socket) {
        console.log(socket.handshake);

        socket.on('message', function(data, callback) {
            socket.broadcast.emit('message', data);
            callback && callback();
        });
    });
};
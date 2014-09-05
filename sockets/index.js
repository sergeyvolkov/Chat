module.exports = function(server) {
    var io = require('socket.io').listen(server);
    io.set('origins', 'localhost:*');

    io.on('connection', function(socket) {
        socket.on('user join', function(data, callback) {
            socket.broadcast.emit('user join');
            callback && callback();
        });

        socket.on('message', function(data, callback) {
            socket.broadcast.emit('message', data);
            callback && callback();
        });

        socket.on('start typing', function() {
            socket.broadcast.emit('start typing');
        });

        socket.on('end typing', function() {
            socket.broadcast.emit('end typing');
        });

        socket.on('disconnect', function() {
            console.log('user left');
            socket.broadcast.emit('user left');
        });
    });
};
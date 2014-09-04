module.exports = function(server) {
    var io = require('socket.io').listen(server);
    io.set('origins', 'localhost:*');

    io.on('connection', function(socket) {
        socket.on('message', function(data, callback) {
            socket.broadcast.emit('message', data);
            callback && callback();
        });

        socket.on('start typing', function() {
            socket.broadcast.emit('start typing');
        });
    });
};
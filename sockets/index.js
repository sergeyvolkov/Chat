module.exports = function(server) {
    var io = require('socket.io').listen(server),
        users = [];

    io.set('origins', 'localhost:*');

    setInterval(function() {
        console.log(users);
    }, 5000);

    io.on('connection', function(socket) {
        socket.on('user join', function(username, callback) {
            var err = null,
                options = {},
                message;

            options.sender = 'System';
            if (users.indexOf(username) === -1) {
                users.push(username);

                // create broadcast message
                options.content = username + ' has been joined now';
                message = createMessage(options);
                socket.broadcast.emit('user join', message);

                options.content = 'You have been joined to chat (username: ' + username + ')';
            } else {
                err = true;
                options.content = 'User ' + username + ' already exists';
            }

            message = createMessage(options);
            callback(err, message);
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

    function createMessage(options) {
        var sender = options.sender || 'aninim',
            currentDate = new Date(),
            currentTime = currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();

        return {
            sender:     sender,
            content:    options.content,
            date:       currentTime
        };
    }
};
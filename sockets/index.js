module.exports = function(server) {
    var io = require('socket.io').listen(server),
        socketIOFileUpload = require('socketio-file-upload'),
        users = [],
        usersList = {
            authUsers:  [],
            guests:     0
        };

    io.set('origins', '*:*');

    setInterval(function() {
        console.log('Usernames: ' + usersList.authUsers);
        console.log('Guests: ' + usersList.guests);
    }, 10e3);

    io.on('connection', function(socket) {
        var uploader = new socketIOFileUpload();
        uploader.dir = 'public/uploads';
        uploader.listen(socket);

        uploader.on('saved', function(event) {
            var fileInfo = event.file,
                message;

            message = createMessage({
                content:        fileInfo.pathName.replace('public', ''),
                contentType:    'image'
            });

            socket.broadcast.emit('message', message);
        });

        uploader.on('error', function(event) {
        });

        socket.on('guest mode', function() {
            ++usersList.guests;
        });

        socket.on('user join', function(username, callback) {
            var err = null,
                options = {},
                message;

            options.sender = 'System';
            if (!findBy('username', username)) {
                addUser(username, socket);

                // create broadcast message
                options.content = username + ' has been joined now';
                message = createMessage(options);
                socket.broadcast.emit('user join', message);

                options.content = 'You have been joined to chat (username: ' + username + ')';

                --usersList.guests;
                usersList.guests = (usersList.guests < 0) ? 0 : usersList.guests;
            } else {
                err = true;
                options.content = 'User ' + username + ' already exists';
            }

            message = createMessage(options);
            callback(err, message);

            io.sockets.emit('users list', usersList);
        });

        socket.on('message', function(data, callback) {
            var message = createMessage(data);

            socket.broadcast.emit('message', message);
            callback && callback(message);
        });

        socket.on('start typing', function(data) {
            socket.broadcast.emit('start typing', data);
        });

        socket.on('end typing', function(data) {
            socket.broadcast.emit('end typing', data);
        });

        socket.on('disconnect', function() {
            var user = findBy('socket', socket),
                options = {},
                message;

            if (user) {
                options.sender = 'System';
                options.content = 'User ' + user.username + ' left chat';

                message = createMessage(options);

                socket.broadcast.emit('user left', message);

                removeUser(user.username);

            } else {
                --usersList.guests;
                usersList.guests = (usersList.guests < 0) ? 0 : usersList.guests;
            }

            io.sockets.emit('users list', usersList);

        });

    });

    setInterval(function() {
        io.sockets.emit('users list', usersList);
    }, 2e3);

    function createMessage(options) {
        var sender = options.sender || 'aninim',
            contentType = options.contentType || 'text';

        return {
            sender:         sender,
            content:        options.content,
            contentType:    contentType,
            date:           new Date()
        };
    }

    function findBy(key, needle) {
        var i,
            length = users.length;

        if (key != 'username' && key != 'socket') {
            return null;
        }

        for (i = 0; i < length; i++) {
            if (users[i][key] == needle) {
                return users[i];
            }
        }

        return null;
    }

    function addUser(username, socket) {
        users.push({
            username: username,
            socket: socket
        });

        usersList.authUsers.push(username);
    }

    function removeUser(username) {
        var i,
            length = users.length;

        for (i = 0; i < length; i++) {
            if (users[i].username == username) {
                users.splice(i, 1);
                usersList.authUsers.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    function getTime() {
        var date = new Date(),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds();

        hours = (hours < 9) ? '0' + hours : hours;
        minutes = (minutes < 9) ? '0' + minutes : minutes ;
        seconds = (seconds < 9) ? '0' + seconds : seconds;

        return hours + ':' + minutes + ':' + seconds;
    }
};
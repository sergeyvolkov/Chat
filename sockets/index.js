module.exports = function(server) {
    var io = require('socket.io').listen(server),
        socketIOFileUpload = require('socketio-file-upload'),
        users = [];

    io.set('origins', '*:*');

    setInterval(function() {
		console.log(visitorsInfo());
	}, 10e3);

    io.on('connection', function(socket) {
		/**
		 * when someone is connected then updated visitors info for all clients
		 * also this info updated when some user finished sign in or disconnect
		 */
		io.sockets.emit('users list', visitorsInfo());

        var uploader = new socketIOFileUpload();
        uploader.dir = 'public/uploads';
        uploader.listen(socket);

        uploader.on('saved', function(event) {
            var user = findBy('socket', socket).username || 'aninim',
                fileInfo = event.file,
                message;

            message = createMessage({
                sender:         user,
                content:        fileInfo.pathName.replace('public', ''),
                contentType:    fileInfo.type.split('/')[0]
            });

            io.sockets.emit('message', message);
        });

        uploader.on('error', function(event) {
        });

        socket.on('user join', function(username, callback) {
            var err = null,
                options = {},
                message;

            options.sender = 'System';
            if (!findBy('username', username)) {
                addUser(username, socket);
				// one guest "left" chat, one auth user "join"
				io.sockets.emit('users list', visitorsInfo());

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

			io.sockets.emit('users list', visitorsInfo());

            if (user) {
                options.sender = 'System';
                options.content = 'User ' + user.username + ' left chat';

                message = createMessage(options);

                socket.broadcast.emit('user left', message);

                removeUser(user.username);

            }

        });

    });

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
    }

    function removeUser(username) {
        var i,
            length = users.length;

        for (i = 0; i < length; i++) {
            if (users[i].username == username) {
                users.splice(i, 1);
                return true;
            }
        }

        return false;
    }

	function visitorsInfo() {
		var totalVisitorsCount,
			authUsersCount,
			guestsCount,
			usernames;

		// get all usernames
		usernames = users.map(function(user) {
			return user.username;
		});

		totalVisitorsCount = io.sockets.sockets.length;
		authUsersCount = users.length;
		guestsCount = totalVisitorsCount - authUsersCount;

		return {
			total:		totalVisitorsCount,
			users:		authUsersCount,
			usernames:	usernames,
			guests:		guestsCount
		};
	}

};
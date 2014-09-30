module.exports = function(server, app) {
    var io = require('socket.io').listen(server),
        socketIOFileUpload = require('socketio-file-upload'),
        username,
        users = [],
		usersIndex = 1;

	// allowed for all hosts and ports
    io.set('origins', '*:*');

    io.on('connection', function(socket) {
		var uploader;

        username = app.locals.user.username;

		/**
		 * when someone is connected then updated visitors info for all clients
		 * also this info updated when some user finished sign in or disconnect
		 */
		io.sockets.emit('users list', visitorsInfo());

		/**
		 * New guests automatically get username like 'username-N'
		 */
        socket.on('user join', function(callback) {
            var message,
				options = {};

            options.sender = 'System';

			// one guest "left" chat, one auth user "join"
			addUser(username, socket);
			io.sockets.emit('users list', visitorsInfo());

			// create broadcast message for other
			options.content = username + ' has been joined now';
			message = createMessage(options);
			socket.broadcast.emit('user join', message);

			// create message for user
			options.content = 'You have been joined to chat (username: ' + username + ')';

            message = createMessage(options);
            callback && callback(message, username);

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

		/**
		 * Upload settings
		 * @type {SocketIOFileUploadServer}
		 */
		uploader = new socketIOFileUpload();
		uploader.dir = 'public/uploads';
		uploader.listen(socket);

		// send public file path to client
		uploader.on('saved', function(event) {
			var file = event.file;
			file.clientDetail.filePath = file.pathName.replace('public', '');
		});

    });

    function createMessage(options) {
        var sender = options.sender || 'aninim';

        return {
            sender:         sender,
            content:        options.content,
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
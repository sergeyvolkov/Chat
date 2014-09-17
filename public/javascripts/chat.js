$(document).ready(function() {
    var socket = io(),
        username,
        $message = $('#message'),
        $messages = $('.messages'),
        $authModal = $('#auth-modal'),
        modalOptions = {},
        typing;

    modalOptions = {
        backdrop:   'static',
        keyboard:   false,
        show:       true
    };
    $authModal.modal(modalOptions);

    // set un-auth user as "guest"
    socket.emit('guest mode');

    // check login
    $('#auth-submit').on('click', function() {
        username = $('#login').val();
        $authModal.modal('hide');

        socket.emit('user join', username, function(err, data) {
            if (err) {
                username = null;
                $authModal.modal(modalOptions);
            }

            printMessage(data);
        });
    });

    // typing
    $message.on('input', function() {
        socket.emit('start typing', username);
        if (typing != undefined) {
            clearTimeout(typing);
        }

        typing = setTimeout(function() {
            socket.emit('end typing', username);
        }, 1e3);

    });

    // send message
    $('#send-message').on('click', function() {
        var $message = $('#message'),
            message = {};

        message.content = $message.val();
        message.sender = username;

        socket.emit('message', message, function(message) {
            printMessage(message);
        });
        $message.val('');
    });

    // close page
    $(window).bind("unload", function() {
        if (username) {
            socket.disconnect(username);
        }
    });

    // websockets behaviour
    socket
        .on('user join', function(data) {
            printMessage(data);
        })
        .on('start typing', function(data) {
            typeMessage('start', data);
        })
        .on('end typing', function(data) {
            typeMessage('end', data);
        })
        .on('message', function(data) {
            printMessage(data);
            typeMessage('end', data.sender);
        })
        .on('user left', function(data) {
            printMessage(data);
        })
        .on('users list', function(data) {
            updateUserList(data);
        });

    function printMessage(message) {
        var $newMessage,
            content;

        content = message.sender
            + ' [' + message.date + ']' + '<br>'
            + message.content + '<br><br>';

        $newMessage = $('<div>')
            .addClass('system')
            .html(content);

        $newMessage.appendTo($messages);

        return true;
    }

    function updateUserList(users) {
        var content;

        content = 'Online users: ' + users.authUsers.join(', ') + '<br>';
        content += 'Aninims: ' + users.guests;

        $('.users').html(content);
    }

    function typeMessage(action, username) {
        var $systemMessages = $('.system-messages'),
            $typeDiv,
            $existMessage;

        /**
         * if system message with same user and action already exists and action == end, then remove exists message
         * if system message doesn't exist and action == start, then add new
         */
        $existMessage = $systemMessages.find('[data-username="' + username + '"]');
        if ($existMessage.length && action == 'end') {
            $existMessage.remove();
        } else if (!$existMessage.length && action == 'start') {
            $typeDiv = $('<div>', {
                'data-username': username,
                text: username + ' is typing'
            });

            $typeDiv.appendTo($systemMessages);
        }

    }

});
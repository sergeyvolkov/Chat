$(document).ready(function() {
    var socket = io(),
        username,
        $message = $('#message'),
        $sendMessage = $('#send-message'),
        $messages = $('.messages'),
        $authModal = $('#auth-modal'),
        $authSubmit = $('#auth-submit'),
        typing,
        emojiContent,
        siofu = new SocketIOFileUpload(socket);

    $authModal.modal('show');

    // check login
    $authSubmit.on('click', function() {
        username = $('#login').val();

        // give role 'guest' if user choose empty string as username
        if (username === '') {
            username = null;
            return false;
        }

        socket.emit('user join', username, function(err, data) {
            if (err) {
                username = null;
            }

            printMessage(data);
        });

        $authModal.modal('hide');
    });
    $authModal.on('hidden.bs.modal', function() {
        if (!username) {
            username = null;
        }
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
    $sendMessage.on('click', function() {
        var message = {};

        message.content = $message.html();
        message.sender = username;

        socket.emit('message', message, function(message) {
            printMessage(message);
        });
        $message.html('');
    });

    // close page
    $(window).bind("unload", function() {
        if (username) {
            socket.disconnect(username);
        }
    });

    // keypresses: if user type Ctrl + Enter on login or message input, then submit form
    $('#login').on('keypress', function(e) {
        if (ctrlEnterPress(e)) {
            $authSubmit.click();
        }
    });
    $message.on('keypress', function(e) {
        if (ctrlEnterPress(e)) {
            $sendMessage.click();
        }
    });

    // update timeago
    setInterval(function() {
        var $datetimes = $('.moment-time');

        $.each($datetimes, function() {
            var $self = $(this),
                time = $self.data('time'),
                timeAgoText = moment().from(time);

            $self.html(timeAgoText);
        });
    }, 2e3);

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
            content,
            messagesHeight = $messages[0].scrollHeight,
            messageTime = moment(message.date).format('HH:mm:ss'),
            messageTimeAgo = moment().from(messageTime);

        switch (message.contentType) {
            case 'image':
                message.content = '<img class="attachment-image" src="' + message.content + '">';
                break;
			case 'audio':
				message.content = '<audio src="' + message.content + '" controls></audio>';
				break;
            case 'text':
            default:
                message.content = emojify.replace(message.content);
                break;
        }

        content = message.sender
            + ' [' + messageTime + ']' + ' (<span class="moment-time" data-time="' + message.date
            + '" >' + messageTimeAgo + '</span>)' + '<br>'
            + message.content + '<br><br>';

        $newMessage = $('<div>')
            .addClass('system')
            .html(content);

        // fix for Chrome
        $('html, body').animate({scrollTop: messagesHeight}, 'slow');

        $newMessage.appendTo($messages);

        return true;
    }

    function updateUserList(users) {
		$('.total-count').text(users.total);
		$('.auth-count').text(users.users);
		$('.guests-count').text(users.guests);
    }

    function typeMessage(action, username) {
        var $systemMessages = $('.system-messages'),
            $typeDiv,
            $existMessage;

        if (username == null) {
            username = 'aninim';
        }

        /**
         * if system message with same user and action already exists and action == end, then remove exists message
         * if system message doesn't exist and action == start, then add new
         */
        $existMessage = $systemMessages.find('[data-username="' + username + '"]');
        if ($existMessage.length && action == 'end') {
            $existMessage.remove();
        } else if (!$existMessage.length && action == 'start') {
            $typeDiv = $('<div>', {
                class: 'typing-message',
                'data-username': username,
                html: username + ' is typing <i class="fa fa-spinner fa-spin"></i>'
            });

            $typeDiv.appendTo($systemMessages);
        }

    }

    function ctrlEnterPress(event) {
        // @todo add other browsers
        return event.ctrlKey && event.keyCode == 10;
    }


    // setup emojify
    emojify.setConfig({
        img_dir          : 'vendor/bower_components/emojify/images/emoji',  // Directory for emoji images
        ignored_tags     : {                // Ignore the following tags
            'SCRIPT'  : 1,
            'TEXTAREA': 1,
            'A'       : 1,
            'PRE'     : 1,
            'CODE'    : 1
        }
    });
    emojiContent = ':smile: :blush: :expressionless: :unamused:';
    $('.smiles')
        .popover({
            html: true,
            trigger: 'click',
            placement: 'top',
            content: emojify.replace(emojiContent)
        })
        .on('shown.bs.popover', function() {
            var $popover = $(this);
            $('.smiles + .popover img').on('click', function() {
                var messageContent = $message.html();
                $message.html(messageContent + ' ' + $(this).attr('title'));
                $popover.popover('hide');
            });
        });

    // setup file uploading
    siofu.listenOnInput(document.getElementById('file-upload'));
    siofu.addEventListener('complete', function(e) {
        console.log(e);
    }, false);
});
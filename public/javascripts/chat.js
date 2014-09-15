$(document).ready(function() {
    var socket = io(),
        typingTimer,
        username,
        $messages = $('.messages'),
        $authModal = $('#auth-modal'),
        modalOptions = {};

    modalOptions = {
        backdrop:   'static',
        keyboard:   false,
        show:       true
    };
    $authModal.modal(modalOptions);

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

    // websockets behaviour
    socket.on('user join', function(data) {
        printMessage(data);
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

    return true;

    socket
        .on('message',  function(message) {
            printMessage(message);
        })
        .on('user join', function() {
            printMessage('Someone is joined', 'system');
        })
        .on('start typing', function() {
            typingMessage(true);
        })
        .on('end typing', function() {
            typingMessage(false);
        })
        .on('user left', function() {
            printMessage('Someone is left :(', 'system');
        });

    $('#send-message').on('click', sendMessage);
    $('#message').on('input', typeMessage)
        .on('keydown', endTypeMessage);

    function sendMessage() {
        var $message = $('#message'),
            messageContent = $message.val();

        socket.emit('message', messageContent, function() {
            printMessage(messageContent, 'own');
        });
        socket.emit('end typing');
        $message.val('');
    }

    function typeMessage() {
        var action;

        action = ($('#message').val()) ? 'start typing' : 'end typing';
        socket.emit(action);

        typingTimer = setTimeout(function() {
            socket.emit('end typing');
        }, 1000);
    }

    function endTypeMessage() {
        clearTimeout(typingTimer);
    }


    function typingMessage(show) {
        var display = (show) ? 'block' : 'none';
        $('.typing').css('display', display);
    }
});
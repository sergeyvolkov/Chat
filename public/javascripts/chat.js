$(document).ready(function() {
    var users = [],
        socket = io(),
        typingTimer,
        username,
        $messages = $('.messages'),
        $authModal = $('#auth-modal');

    $authModal.modal({
        backdrop:   'static',
        keyboard:   false,
        show:       true
    });

    // check login
    $('#auth-submit').on('click', function() {
        username = $('#login').val();
        $authModal.modal('hide');
    });
    return true;

    socket.emit('user join', {}, function() {
        printMessage('You are joined to chat', 'system');
    });

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

    function printMessage(message, type) {
        var $newMessage,
            typeClass;

        typeClass = ' ' + (type) + '-message';

        $newMessage = $('<div>')
            .addClass('message-wrapper' + typeClass)
            .append(
                $('<div>')
                    .addClass('message')
                    .text(message)
            );

        $newMessage.appendTo($messages);

        return true;
    }

    function typingMessage(show) {
        var display = (show) ? 'block' : 'none';
        $('.typing').css('display', display);
    }
});
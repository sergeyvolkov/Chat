$(document).ready(function() {
    var socket = io(),
        $messages = $('.messages');

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
    $('#message').on('input', typeMessage);

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
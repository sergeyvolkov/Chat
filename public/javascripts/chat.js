$(document).ready(function() {
    var socket = io(),
        $messages = $('.messages');

    socket
        .on('message',  function(message) {
            printMessage(message);
        })
        .on('start typing', function() {
            typingMessage(true);
        });

    $('#send-message').on('click', sendMessage);
    $('#message').on('input', typeMessage);

    function sendMessage() {
        console.log('send');
        var $message = $('#message'),
            messageContent = $message.val();

        socket.emit('message', messageContent, function() {
            printMessage(messageContent, true);
        });
        $message.val('');
    }

    // for other typing icon shown
    function typeMessage() {
        socket.emit('start typing');
    }

    function printMessage(message, isOwn) {
        var $newMessage,
            isOwnClass;

        isOwnClass = (isOwn) ? ' own-message' : '';

        $newMessage = $('<div>')
            .addClass('message-wrapper' + isOwnClass)
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
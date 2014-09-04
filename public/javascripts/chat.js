$(document).ready(function() {
    var socket = io(),
        $messages = $('.messages');

    socket.on('message',  function(message) {
        printMessage(message);
    });

    $('#send-message').on('click' , sendMessage);

    function sendMessage() {
        var $message = $('#message'),
            messageContent = $message.val();

        socket.emit('message', messageContent, function() {
            printMessage(messageContent, true);
        });
        $message.val('');
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

        console.log($newMessage);

        $newMessage.appendTo($messages);

        return true;
    }
});
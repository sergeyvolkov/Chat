$(document).ready(function() {
    var socket = io(),
        $messages = $('#messages');

    socket.on('message',  function(message) {
        printMessage(message);
    });

    $('#send-message').on('click' , sendMessage);

    function sendMessage() {
        var $message = $('#message'),
            messageContent = $message.val();

        socket.emit('message', messageContent, function() {
            printMessage(messageContent);
        });
        $message.val('');
    }

    function printMessage(message) {
        var $newMessage = $('<span>');

        $newMessage.text(message)
            .addClass('message')
            .appendTo($messages);

        return true;
    }
});
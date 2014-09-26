$(document).ready(function() {
    var socket = io(),
        username,
        $message = $('#message'),
        $sendMessage = $('#send-message'),
        $messages = $('.messages'),
        typing,
        emojiContent,
        siofu = new SocketIOFileUpload(socket),
		templates;

	// define all templates
	templates = {
		message:		{
			time:		'[<%= time %>] (<span class="moment-time" data-time="<%= timeStamp %>"><%= timeAgo %></span>)',
			message:	'<%= author %> <%= time %><br> <%= content %><br>'
		},
		attachments:	{
			image:	'<img src="<%= src %>" class="attachment-image" >',
			audio:	'<audio src=" <%= src %>" controls></audio>',
			text:   '<% src %>'
		}
	};

	/**
	 * Temporary get random name. First step for passport.js :)
	 */
	socket.emit('user join', function(message, currentUsername) {
		username = currentUsername;
		printMessage(message);
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
        })
		.on('disconnect', function() {
			// @todo add behaviour
		});

    function printMessage(message) {
        var $newMessage,
            content,
			contentTime,
            messagesHeight = $messages[0].scrollHeight;

		contentTime = _.template(templates.message.time, {
			time:		moment(message.date).format('HH:mm:ss'),
			timeStamp:	message.date,
			timeAgo:	moment().from(moment(message.date).format('HH:mm:ss'))
		});
		content = _.template(templates.message.message, {
			author:		message.sender,
			time:		contentTime,
			content:	message.content
		});

        $newMessage = $('<div>')
            .html(content);

        // fix for Chrome
        $('html, body').animate({scrollTop: messagesHeight}, 'slow');

        $newMessage.appendTo($messages);

        return true;
    }

	/**
	 * Update users list for format:
	 * Total: M
	 * Auth users: N (user1, user2, ..., userN)
	 * Guests: {M - N}
	 *
	 * @param {object} users
	 */
    function updateUserList(users) {
		var usersContent;

		$('.total-count').text(users.total);
		$('.guests-count').text(users.guests);

		usersContent = users.users;
		if (users.usernames.length) {
			usersContent += ' (' + users.usernames.join(', ') + ')';
		}

		$('.auth-count').text(usersContent);
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

	function appendTextToMessage(text) {
		var content = $message.html();
		$message.html(content + ' ' + text);
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
				appendTextToMessage($(this).prop('outerHTML'));
                $popover.popover('hide');
            });
        });
	// close popover on outside click
	$('body').on('click', function (e) {
		if ($(e.target).hasClass('smiles')) {
			return true;
		}
		$('div.popover').each(function () {
			//the 'is' for buttons that trigger popups
			//the 'has' for icons within a button that triggers a popup
			if (!$(this).is(e.target) && $(this).has(e.target).length === 0
				&& $('.popover').has(e.target).length === 0
			) {
				$(this).popover('hide');
			}
		});
	});

    // setup file uploading
    siofu.listenOnInput(document.getElementById('file-upload'));
	// add meta data for server
    siofu.addEventListener('complete', function(event) {
        var mimeType = event.file.type.split('/'),
			currentTemplate,
			content;

		// add attachment to message

		mimeType = mimeType[0];

		// check if mime type's template exists, use it
		// otherwise use plain text
		currentTemplate = (templates.attachments[mimeType])
			? templates.attachments[mimeType]
			: templates.attachments.text;
		content = _.template(currentTemplate, {'src': event.detail.filePath});
		appendTextToMessage(content);
    }, false);
});
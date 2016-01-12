/*
# ui/notify

Exports a single function to show notifications which appear at the top of the window.
*/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var notificationTemplate = require('./notification.ejs');

/*
Shows a notification at the top of the browser window.

@static
@param {String} message HTML source of the message to display
@param {String} [className] CSS class to apply to the notification. If this is
	'danger', then the notification must be dismissed by the user.
*/

module.exports = function(message, className) {
	var $container = $('#notifications');

	// Set up the container if it doesn't already exist.

	if ($container.length == 0) {
		$container = $('<div id="notifications"></div>');
		$container.on('click', '.close', function(e) {
			var notification = $(e.target).closest('.notification');

			notification
				.removeClass('fadeIn')
				.addClass('fadeOut')
				.one('animationend', function() {
					notification.remove();
				});
		});

		$('body').append($container);
	}

	var templateOptions = {
		message: message,
		className: className || 'info'
	};
	var n = $(Marionette.Renderer.render(notificationTemplate, templateOptions));

	$container.append(n);

	function hideNotification() {
		n
			.removeClass('fadeIn')
			.addClass('fadeOut')
			.one('animationend', function() {
				$(this).remove();
			});
	}

	if (className !== 'danger') {
		window.setTimeout(hideNotification, 3000);
	}
};

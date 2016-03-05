/**
 Manages notifications that can be created on the fly.

 @module ui/notify
**/

'use strict';
const $ = require('jquery');
const Marionette = require('backbone.marionette');
const ui = require('./index');
const notificationTemplate = require('./ejs/notification.ejs');

$(ui).on('init', (e, options) => {
	options.$body.on('click.twineui', '#notifications .close', function() {
		// click handler for closing notifications

		const notification = $(this).closest('div');

		notification.addClass('fadeOut').one('animationend', () => {
			notification.remove();
		});
	});
});

/**
 Shows a notification at the top of the browser window.

 @param {String} message HTML source of the message to display
 @param {String} className CSS class to apply to the notification
**/

module.exports = (message, className = "") => {
	const notificationDiv = $('#notifications');
	if (notificationDiv.length === 0) {
		$('body').append('<div id="notifications"></div>');
	}

	// If there is already a notification with this exact message, don't add it.
	if (notificationDiv.children()
			.filter((_, el) => $(el).find('span').html() === message).length) {
		return;
	}

	const n = $(Marionette.Renderer.render(notificationTemplate,
		{ message, className }));

	$('#notifications').append(n);

	if (className !== 'danger') {
		window.setTimeout(() => {
			n
				.addClass('fadeOut')
				.one('animationend', () => {
					n.remove();
				});
		}, 3000);
	}
};

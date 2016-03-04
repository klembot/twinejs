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

		notification.addClass('fadeOut');
		notification.one('animationend', function() {
			$(this).remove();
		});
	});
});

/**
 Shows a notification at the top of the browser window.

 @param {String} message HTML source of the message to display
 @param {String} className CSS class to apply to the notification
**/

module.exports = (message, className) => {
	if ($('#notifications').length === 0) {
		$('body').append('<div id="notifications"></div>');
	}

	const n = Marionette.Renderer.render(notificationTemplate,
		{ message, className });

	$('#notifications').append(n);

	if (className != 'danger') {
		window.setTimeout(function() {
			$(this)
				.addClass('fadeOut')
				.one('animationend', function() {
					$(this).remove();
				});
		}.bind(n), 3000);
	}
};

/**
 Manages notifications that can be created on the fly.

 @module ui/notify
**/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var ui = require('./index');
var notificationTemplate = require('./ejs/notification.ejs');

$(ui).on('init', function (e, options)
{
	options.$body.on('click.twineui', '#notifications .close', function()
	{
		// click handler for closing notifications

		var notification = $(this).closest('div');
		notification.addClass('fadeOut');
		notification.one('animationend', function()
		{
			$(this).remove();
		});
	});
});

/**
 Shows a notification at the top of the browser window.

 @param {String} message HTML source of the message to display
 @param {String} className CSS class to apply to the notification
**/

module.exports = function (message, className)
{
	if ($('#notifications').length === 0)
		$('body').append('<div id="notifications"></div>');

	var n = Marionette.Renderer.render(notificationTemplate,
	                                   { message: message, className: className });

	$('#notifications').append(n);

	if (className != 'danger')
		window.setTimeout(function()
		{
			$(this).addClass('fadeOut')
			.one('animationend', function()
			{
				$(this).remove();
			});
		}.bind(n), 3000);
};

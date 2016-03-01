/**
 Manages modals with a single text input, a la window.prompt.

 @module ui/confirm
**/

'use strict';
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var ui = require('./');
var confirmTemplate = require('./ejs/confirm.ejs');

/**
 Shows a modal confirmation dialog, with one button (to continue the action)
 and a Cancel button.

 @param {String} message HTML source of the message
 @param {String} buttonLabel HTML label for the button
 @param {Function} callback function to call if the user continues the button
 @param {Object} options Object with optional parameters:
						 modalClass (CSS class to apply to the modal),
						 buttonClass (CSS class to apply to the action button)
**/

module.exports = (message, buttonLabel, callback, options) => {
	options = options || {};

	var modalContainer = $(Marionette.Renderer.render(confirmTemplate, {
		message,
		buttonLabel,
		modalClass: options.modalClass || '',
		buttonClass: options.buttonClass || ''
	}));

	var modal = modalContainer.find('.modal');

	modal.on('click', 'button', function() {
		if ($(this).data('action') == 'yes' && callback) {
			callback();
		}

		modal.data('modal').trigger('hide');
	});

	$('body').append(modalContainer);
	$(ui).trigger('attach', { $el: modalContainer });
	modal.data('modal').trigger('show');
};

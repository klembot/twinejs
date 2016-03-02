/**
 Manages modals with a single text input, a la window.prompt.

 @module ui/prompt
**/

'use strict';
const $ = require('jquery');
const Marionette = require('backbone.marionette');
const ui = require('./index.js');
const promptTemplate = require('./ejs/prompt.ejs');

/**
 Shows a modal dialog asking for the user to enter some text, with one
 button (to continue the action) and a Cancel button.

 @param {String} message HTML source of the message
 @param {String} buttonLabel HTML label for the button
 @param {Function} callback function to call if the user continues the button;
							passed the entered value
 @param {Object} options Object with optional parameters:
						 defaultText (default text for the input),
						 modalClass (CSS class to apply to the modal),
						 buttonClass (CSS class to apply to the action button)
**/

module.exports = (message, buttonLabel, callback, options) => {
	options = options || {};
	options.defaultText = options.defaultText || '';

	const modalContainer = $(Marionette.Renderer.render(promptTemplate, {
		message,
		defaultText: options.defaultText,
		buttonLabel,
		modalClass: options.modalClass || '',
		buttonClass: options.buttonClass || ''
	}));

	const modal = modalContainer.find('.modal');

	modal.on('click', 'button', function() {
		if ($(this).data('action') == 'yes' && callback) {
			callback(modal.find('.prompt input[type="text"]').val());
		}

		modal.data('modal').trigger('hide');
	});

	modal.on('submit', 'form', () => {
		modal.find('button[data-action="yes"]').click();
	});

	$('body').append(modalContainer);
	$(ui).trigger('attach', { $el: modalContainer });
	modal.data('modal').trigger('show');
	modal.find('input[type="text"]').focus()[0].setSelectionRange(
		0,
		options.defaultText.length
	);
};

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
 button (to confirm the action) and a Cancel button.

 @param {Object} options Object with parameters:
 						 message (message HTML source of the message)
						 [defaultText] (default text for the input. NOT parsed as HTML!),
						 [modalClass] (CSS class to apply to the modal),
						 [buttonClass] (CSS class to apply to the action button)
						 buttonLabel (HTML label for the button)
						 [blankTextError] (error message to show if only whitespace was entered)
**/

module.exports = ({message, buttonLabel, blankTextError, defaultText, modalClass, buttonClass}) =>
	new Promise((onConfirm, onCancel) => {

		const modalContainer = $(Marionette.Renderer.render(promptTemplate, {
			message,
			defaultText: defaultText || '',
			buttonLabel,
			modalClass: modalClass || '',
			buttonClass: buttonClass || '',
			blankTextError: blankTextError || ''
		}));

		const modal = modalContainer.find('.modal');

		// When clicking a button, close.
		modal.on('click', 'button', function() {

			// If it's the 'yes' button, the dialog is confirmed.
			if ($(this).data('action') == 'yes') {
				const text = modal.find('.prompt input[type="text"]').val();

				// Don't submit if a non-whitespace value is required.
				if (!text.trim() && blankTextError) {
					modal.find('.blankTextError').show().fadeIn();
					return;
				}
				onConfirm(text);
			}
			else {
				onCancel();
			}

			modal.data('modal').trigger('hide');
		});

		modal.on('submit', 'form', () => {
			modal.find('button[data-action="yes"]').click();
		});

		// Attach the modal to the body, and show it.
		$('body').append(modalContainer);
		$(ui).trigger('attach', { $el: modalContainer });
		modal.data('modal').trigger('show');

		// Put the cursor in the prompt's textbox.
		modal.find('input[type="text"]').focus()[0].setSelectionRange(
			0,
			(defaultText || '').length
		);
	});

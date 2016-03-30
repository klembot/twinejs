/**
 Manages modals with a single text input, a la window.prompt.

 @module ui/confirm
**/

'use strict';
const $ = require('jquery');
const locale = require('../locale');
const Marionette = require('backbone.marionette');
const ui = require('./');
const confirmTemplate = require('./ejs/confirm.ejs');

/**
 Shows a modal confirmation dialog, with one button (to continue the action)
 and a Cancel button.

 @param {Object} options Object with optional parameters:
						 message (HTML source of the message)
						 [modalClass] (CSS class to apply to the modal),
						 [buttonClass] (CSS class to apply to the action button)
						 buttonLabel (HTML label for the button)
**/

module.exports = ({message, coda, buttonLabel, cancelLabel, modalClass, buttonClass}) =>
	new Promise((onConfirm, onCancel) => {

		const modalContainer = $(Marionette.Renderer.render(confirmTemplate, {
			message,
			buttonLabel,
			cancelLabel: cancelLabel || ('<i class="fa fa-times"></i> ' + locale.say("Cancel")),
			modalClass: modalClass || '',
			buttonClass: buttonClass || '',
			coda: coda || "",
		}));

		const modal = modalContainer.find('.modal');

		modal.on('click', 'button', function() {
			if ($(this).data('action') == 'yes') {
				onConfirm();
			}
			else {
				onCancel();
			}

			modal.data('modal').trigger('hide');
		});

		$('body').append(modalContainer);
		$(ui).trigger('attach', { $el: modalContainer });
		modal.data('modal').trigger('show');
	});

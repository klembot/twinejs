/*
# ui/modal/prompt

Creates a modal similar to `window.prompt()`.
*/

'use strict';
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var modal = require('./index.js');
var promptTemplate = require('./prompt.ejs');

/*
Opens the modal.

@static
@param {Object} options Options governing the modal. One property is required,
	`content`, which is the HTML content to display. Other optional properties:
	`callback`, a function to call when the user makes a decision,
	`confirmLabel`, the label of the confirm button, `confirmClass`, the CSS
	class of the confirm button, and `cancelLabel`, the label of the cancel
	button.
*/
module.exports = function(options) {
	var templateOptions = _.defaults(options, {
		confirmClass: 'primary',
		confirmLabel: 'OK',
		cancelLabel: 'Cancel',
		defaultValue: ''
	});

	var promptModal = modal.open({
		content: Marionette.Renderer.render(promptTemplate, templateOptions)
	});

	promptModal
		.on('modalOpen.twineui', function() {
			var input = promptModal.find('input.promptValue');

			input.focus();
			input.select();
		})
		.on('click.twineui', '[data-action="yes"]', function() {
			if (options.callback) {
				options.callback(true, promptModal.find('input.promptValue').val());
			}
		})
		.on('modalClose.twineui', function() {
			if (options.callback) {
				options.callback(false);
			}

			promptModal.off('.twineui');
		});

	return promptModal;
};

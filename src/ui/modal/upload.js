/*
# ui/modal/upload

Exports a function that prompts the user for a file upload.
*/

'use strict';
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var file = require('../../file');
var modal = require('./index.js');
var uploadTemplate = require('./upload.ejs');

/*
Opens the modal.

@param {Object} options Options governing the modal. One property is required,
	`content`, which is the HTML content to display. Other optional properties:
	`callback`, a function to call when the user makes a decision,
	`confirmLabel`, the label of the confirm button, `confirmClass`, the CSS
	class of the confirm button, `cancelLabel`, the label of the cancel
	button, and `autoclose`, whether to close the modal as soon as the user
	uploads the file.
@return {DOMElement} the created modal
@static
*/

function upload(options) {
	var templateOptions = _.defaults(options, {
		autoclose: true,
		confirmClass: 'primary',
		confirmLabel: 'Choose File',
		cancelLabel: 'Cancel'
	});

	var uploadModal = modal.open({
		content: Marionette.Renderer.render(uploadTemplate, templateOptions)
	});

	var uploaded = false;

	uploadModal.one(
		'change.twineui', '.fileChooser input[type="file"]',
		function(e) {
			if (options.onFileChosen) options.onFileChosen();

			file.readInputEl(e.target, function afterFileRead(readEvent) {
				if (options.callback) {
					options.callback(true, readEvent.target.result);
				}

				uploaded = true;
				if (options.autoclose) modal.close();
			});
		})
	.on('modalClose.twineui', function() {
		if (! uploaded && options.callback) options.callback(false);
		uploadModal.off('.twineui');
	});

	return uploadModal;
}

upload.close = function() {
	modal.close();
};

module.exports = upload;

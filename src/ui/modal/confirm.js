/*
# ui/modal/confirm

Exports a function which shows a confirmation modal similar to
`window.confirm()`.
*/


'use strict';
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var modal = require('./index.js');
var confirmTemplate = require('./confirm.ejs');

/*
Opens the confirmation.

@param {Object} options An object with one required property: `content` (HTML
	content to show). The rest are optional: `confirmLabel`, the label on the
	confirmation button, `confirmClass`, any CSS classes to add to the confirm
	button, `cancelLabel`, the label on the cancel button, and `callback`, a
	function which will be called with a single Boolean corresponding to
	whether the user chose the confirmation button.
@static
*/
module.exports = function(options) {
	var confModal = modal.open({
		content: Marionette.Renderer.render(confirmTemplate,
			_.defaults(options, {
				confirmClass: 'primary',
				confirmLabel: 'OK',
				cancelLabel: 'Cancel'
			})
		)
	});

	confModal
		.on('click.twineui', '[data-action="yes"]', function() {
			if (options.callback) options.callback(true);
			confModal.off('.twineui');
		},
		.on('confModalClose.twineui', function() {
			if (options.callback) options.callback(false);
		});

	return confModal;
};

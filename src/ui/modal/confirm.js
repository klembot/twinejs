'use strict';
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var modal = require('./index.js');
var confirmTemplate = require('./confirm.ejs');

module.exports = function (options)
{
	var confModal = modal.open({
		content: Marionette.Renderer.render(confirmTemplate,
				 _.defaults(options, { confirmClass: 'primary', confirmLabel: 'OK', cancelLabel: 'Cancel' }))
	});

	confModal.on('click.twineui', '[data-action="yes"]', function()
	{
		if (options.callback)
			options.callback(true);

		confModal.off('.twineui');
	})
	.on('confModalClose.twineui', function()
	{
		if (options.callback)
			options.callback(false);
	});

	return confModal;
};

'use strict';
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var file = require('../../file');
var modal = require('./index.js');
var uploadTemplate = require('./upload.ejs');

function upload(options)
{
	var uploadModal = modal.open(
	{
		content: Marionette.Renderer.render(uploadTemplate,
				 _.defaults(options, { autoclose: true, confirmClass: 'primary', confirmLabel: 'Choose File', cancelLabel: 'Cancel' }))
	});
	var uploaded = false;

	uploadModal.one('change.twineui', '.fileChooser input[type="file"]', function (e)
	{
		if (options.onFileChosen)
			options.onFileChosen();

		file.readInputEl(e.target, function afterFileRead (readEvent)
		{
			if (options.callback)
				options.callback(true, readEvent.target.result);

			uploaded = true;

			if (options.autoclose)
				modal.close();
		});
	})
	.on('modalClose.twineui', function()
	{
		if (! uploaded && options.callback)
			options.callback(false);

		uploadModal.off('.twineui');
	});

	return uploadModal;
};

upload.close = function()
{
	modal.close();
};

module.exports = upload;

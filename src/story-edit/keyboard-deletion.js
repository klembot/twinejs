'use strict';
var $ = require('jquery');
var confirm = require('../ui/modal/confirm');
var locale = require('../locale');

module.exports =
{
	attach: function (parent)
	{
		$(document).on('keyup.keyboardDeletion', function handleDeleteKey (e)
		{
			if (e.keyCode !== 46 || $('input:focus, textarea:focus').length !== 0)
				return;

			e.preventDefault();

			var selected = parent.children.filter(function (v)
			{
				return v.selected;
			});

			switch (selected.length)
			{
				// bug out if none are selected
				case 0:
				return;

				// immediately delete if it's just one passage
				case 1:
				parent.deleteSelectedPassages();
				break;

				// show a confirmation modal if it's more than just 1
				default:

				// set count appropriately

				// L10n: This message is always shown with more than one passage.
				// %d is the number of passages.
				var message = locale.sayPlural('Are you sure you want to delete this passage?',
											   'Are you sure you want to delete these %d passages? This cannot be undone.',
				                               selected.length);

				confirm(
				{
					content: message,
					confirmLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
					confirmClass: 'danger',
					callback: function afterConfirmation (confirmed)
					{
						if (confirmed)
							parent.deleteSelectedPassages();
					}
				});
			};
		});
	},

	detach: function()
	{
		$(document).off('.keyboardDeletion');
	}
};

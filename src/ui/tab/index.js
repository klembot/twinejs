'use strict';
var $ = require('jquery');

function activateTab (e)
{
	var $tab = $(e.target).closest('button[data-content]');
	$tab.addClass('active').siblings('button[data-content]').removeClass('active');
	$($tab.data('content')).show().siblings().hide();
};

module.exports =
{
	attach: function (el)
	{
		// Add click event listener.

		$(el).on('click.twineui', 'button[data-content]', activateTab);

		// Activate the first tab of each group.

		$(el).find('button[data-content]:first-of-type').click();
	}
};

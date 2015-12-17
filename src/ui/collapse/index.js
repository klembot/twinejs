'use strict';
var $ = require('jquery');

module.exports =
{
	attach: function (el)
	{
		$(el).on('click.twineui', '.collapseToggle', function (e)
		{
			$(e.target).closest('.collapse').toggleClass('expanded');
		});
	}
};

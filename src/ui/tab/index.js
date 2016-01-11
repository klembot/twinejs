/*
# ui/tab

Exports functions to handle simple tabbed interfaces. A tab must be a <button>
element with a `data-content` attribute whose selector points to the content to
display when it's activated. Tab buttons must be siblings to each other;
likewise tab content.
*/


'use strict';
var $ = require('jquery');

function activateTab(e) {
	var $tab = $(e.target).closest('button[data-content]');

	$tab
		.addClass('active')
		.siblings('button[data-content]')
			.removeClass('active');
	$($tab.data('content'))
		.show()
		.siblings()
			.hide();
}

module.exports = {
	attach: function(el) {
		// Add click event listener.

		$(el).on('click.twineui', 'button[data-content]', activateTab);

		// Activate the first tab of each group.

		$(el).find('button[data-content]:first-of-type').click();
	},

	detach: function(el) {
		$(el).off('click.twineui', 'button[data-content]', activateTab);
	}
};

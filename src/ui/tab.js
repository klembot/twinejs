'use strict';
const $ = require('jquery');
const ui = require('./index');

require('../jquery-ext/tab');

$(ui).on('init', (e, options) => {
	options.$body.on('click.twineui', '.tabs button', function() {
		// click handler for tabs

		$(this).tab();
	});
})
.on('attach', (e, options) => {
	// show first tab in each group

	options.$el.find('.tabs button:first-of-type').tab();
});

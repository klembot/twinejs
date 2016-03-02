'use strict';
const $ = require('jquery');

require('../jquery-ext/collapse');
const ui = require('./index');

$(ui).on('init', (e, options) => {
	options.$body.on(
		'click.twineui',
		'.collapseContainer [data-collapse]',
		function() {
			// click handler for showing and hiding collapsed elements

			const $t = $(this);

			$t.collapse($t.data('collapse'));
		}
	);
});

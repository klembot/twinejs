'use strict';
var $ = require('jquery');

require('../jquery-ext/collapse');
var ui = require('./index');

$(ui).on('init', function(e, options) {
	options.$body.on(
		'click.twineui',
		'.collapseContainer [data-collapse]',
		function() {
			// click handler for showing and hiding collapsed elements

			var $t = $(this);

			$t.collapse($t.data('collapse'));
		}
	);
});

var $ = window.jQuery = require('jquery');

require('../../lib/jquery/jquery.powertip.js');
var ui = require('./index');

$(ui).on('attach', (e, options) => {
	// activate tooltips

	options.$el.find('button[title], a[title]').each(function() {
		$(this).powerTip({
			placement: $(this).attr('data-tooltip-dir') || 's'
		});
	});
});

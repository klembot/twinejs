'use strict';
const $ = window.jQuery = require('jquery');

require('../jquery-ext/bubble');
require('../../lib/jquery/jquery.powertip.js');
const ui = require('./index');

$(ui).on('init', (e, options) => {
	const $b = options.$body;
	
	$b.on('click.twineui', '.bubbleContainer [data-bubble]', function() {
		// click handlers for showing and hiding bubbles

		const $t = $(this);
		const bubbleAction = $t.data('bubble');

		$t.bubble(bubbleAction);

		if (bubbleAction == 'show' || bubbleAction == 'toggle') {
			$.powerTip.hide();
		}
	})
	.on('click.twineui', e => {
		// hide all bubbles if a stray click is made

		if ($(e.target).closest('.bubbleContainer').hasClass('active')) {
			return;
		}

		$('.active[data-bubble]').bubble('hide');
	});
});

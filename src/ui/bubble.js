'use strict';
var $ = window.jQuery = require('jquery');

require('../jquery-ext/bubble');
require('../../lib/jquery/jquery.powertip.js');
var ui = require('./index');

$(ui).on('init', function(e, options) {
	var $b = options.$body;
	
	$b.on('click.twineui', '.bubbleContainer [data-bubble]', function() {
		// click handlers for showing and hiding bubbles

		var $t = $(this);
		var bubbleAction = $t.data('bubble');

		$t.bubble(bubbleAction);

		if (bubbleAction == 'show' || bubbleAction == 'toggle') {
			$.powerTip.hide();
		}
	})
	.on('click.twineui', function(e) {
		// hide all bubbles if a stray click is made

		if ($(e.target).closest('.bubbleContainer').hasClass('active')) {
			return;
		}

		$('.active[data-bubble]').bubble('hide');
	});
});

/*
# ui/tooltip

This exports functions to show tooltips on all DOM elements with a title
attribute. Currently, this only remembers titles at the moment when this UI is
attached.
*/

'use strict';
var $ = require('jquery');
var Drop = require('tether-drop');
var shorthands = require('../tether-shorthands');

var Tooltip = Drop.createContext({
	classPrefix: 'tooltip'
});

function activateTooltip(e) {
	var $t = $(e.target);

	// Don't reactivate an already-active tooltip.

	if ($t.data('tooltipActivation')) {
		return;
	}

	$t.data('tooltipActivation', window.setTimeout(function() {
		$t.data('tooltipObj').open();
		$t.data('tooltipActivation', null);
	}, tooltipModule.delay));
}

function deactivateTooltip(e) {
	var $t = $(e.target);
	var timeout = $t.data('tooltipActivation');

	if (timeout) {
		window.clearTimeout(timeout);
	}

	$(e.target).data('tooltipObj').close();
}

var tooltipModule = {
	/*
	Attaches tooltips to a DOM element and its children.

	@method attach
	@param {DOMElement} el element to attach to
	@static
	*/
	attach: function(el) {
		$(el).find('[title]').each(function() {
			var $t = $(this);
			var pos = $t.data('tooltip-pos') || 'bottom center';

			if (shorthands[pos]) {
				pos = shorthands[pos];
			}

			$t.data('tooltipObj', new Tooltip({
				target: this,
				content: $t.attr('title'),
				position: pos
			}));

			$t.on({
				mouseenter: activateTooltip,
				mouseleave: deactivateTooltip
			});
		});
	},

	/*
	Detaches tooltips.

	@method attach
	@param {DOMElement} el element to detach from
	@static
	*/
	detach: function(el) {
		$(el).find('[title]').each(function() {
			$(this)
				.data('tooltipObj', null)
				.off({
					mouseenter: activateTooltip,
					mouseleave: deactivateTooltip
				});
		});
	},

	delay: 250
};

module.exports = tooltipModule;

'use strict';
var $ = require('jquery');
var Drop = require('tether-drop');
var shorthands = require('../tether-shorthands');

var Tooltip = Drop.createContext({
	classPrefix: 'tooltip'
});

function activateTooltip(e)
{
	var $t = $(e.target);

	if ($t.data('tooltipActivation'))
		return;

	$t.data('tooltipActivation', window.setTimeout(function()
	{
		$t.data('tooltipObj').open();
		$t.data('tooltipActivation', null);
	}, tooltipModule.delay));
};

function deactivateTooltip(e)
{
	var $t = $(e.target);
	var timeout = $t.data('tooltipActivation');

	if (timeout)
		window.clearTimeout(timeout);

	$(e.target).data('tooltipObj').close();
};

var tooltipModule =
{
	attach: function (el)
	{
		$(el).find('[title]').each(function()
		{
			var $t = $(this);
			var pos = $t.data('tooltip-pos') || 'bottom center';

			if (shorthands[pos])
				pos = shorthands[pos];

			$t.data('tooltipObj', new Tooltip(
					{
						target: this,
						content: $t.attr('title'),
						position: pos
					}));

			$t.on(
			{
				mouseenter: activateTooltip,
				mouseleave: deactivateTooltip
			});
		});
	},

	delay: 250
};

module.exports = tooltipModule;

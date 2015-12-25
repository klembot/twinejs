'use strict';
var _ = require('underscore');
var $ = require('jquery');
var Drop = require('tether-drop');
var shorthands = require('../tether-shorthands');

var BubbleDrop = Drop.createContext(
{
	classPrefix: 'bubble'
});

function Bubble(options)
{
	var pos = options.position || 'top center';

	if (shorthands[pos])
		pos = shorthands[pos];

	this.drop = new BubbleDrop(
	{
		content: options.content,
		openOn: options.openOn || 'click',
		position: pos,
		target: options.parent,
		tetherOptions:
		{
			constraints:
			[{
				to: 'window',
				attachment: 'together',
				pin: true
			}]
		}
	});

	$(this.drop.content).on('click', '[data-bubble="close"], .menu button', this.close.bind(this));
};

_.extend(Bubble.prototype,
{
	content: function()
	{
		return this.drop.content;
	},

	on: function()
	{
		return this.drop.on.apply(this.drop, arguments);
	},

	off: function()
	{
		return this.drop.off.apply(this.drop, arguments);
	},

	once: function()
	{
		return this.drop.once.apply(this.drop, arguments);
	},

	open: function()
	{
		this.drop.open();
	},

	close: function()
	{
		this.drop.close();
	}
});

module.exports = Bubble;

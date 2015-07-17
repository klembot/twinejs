/**
 This class generates SVG previews of stories.
 @class StoryItemView.Preview
**/

'use strict';
var _ = require('underscore');
var Backbone = require('backbone');

var Preview = Backbone.View.extend(
{
	/**
	 How fast we animate passages appearing, in milliseconds.
	 @property appearDuration
	 @static
	**/

	appearDuration: 500,

	initialize: function (options)
	{
		/**
		 The parent StoryItemView.

		 @property parent
		**/

		this.parent = options.parent;

		/**
		 Whether we have rendered our passages onscreen.

		 @property passagesRendered
		**/
		
		this.passagesRendered = false;

		/**
		 The SVG element on the page.
		 @property svg	
		**/

		this.svg = SVG(this.el);

		/**
		 A hue derived from the story's name,
		 represented as the H part of an HSL color.

		 @property hue
		**/

		this.hue = 0;

		var storyName = this.parent.model.get('name');

		for (var i = storyName.length - 1; i >= 0; i--)
			this.hue += storyName.charCodeAt(i);

		this.hue = this.hue % 360;

		// set overall background color

		this.$el.closest('.story').css('background', 'hsl(' + this.hue + ', 15%, 95%)');
	},

	/**
	 Renders a visualization of passages.

	 @method renderPassages
	 @param {Function} callback If passed, will be called once rendering completes
	**/

	renderPassages: function (callback)
	{
		// set height to fill the remaining space
		// left by the label

		this.svg.height(this.parent.$('.story').innerHeight() - this.parent.$('.label').outerHeight());

		if (this.parent.passages.length > 1)
		{
			// find longest passage

			var maxLength = 0;

			_.each(this.parent.passages, function (passage)
			{
				var len = passage.get('text').length;

				if (len > maxLength)
					maxLength = len;
			});

			// render passages

			var c1 = 'hsl(' + this.hue + ', 88%, 40%)';
			var c2 = 'hsl(' + ((this.hue - 30) % 360) + ', 88%, 40%)';
			var c3 = 'hsl(' + ((this.hue + 30) % 360) + ', 88%, 40%)';

			var minX = Number.POSITIVE_INFINITY;
			var minY = Number.POSITIVE_INFINITY;
			var maxX = Number.NEGATIVE_INFINITY;
			var maxY = Number.NEGATIVE_INFINITY;

			_.each(this.parent.passages, function (passage, i)
			{
				var ratio = passage.get('text').length / maxLength;
				var size = 100 + 200 * ratio;
				var x = passage.get('left');
				var y = passage.get('top');
				var c = this.svg.circle().center(x + 50, y + 50);

				if (i % 3 == 0)
					c.fill({ color: c1, opacity: ratio * 0.9 });
				else
					if (i % 2 == 0)
						c.fill({ color: c2, opacity: ratio * 0.9 });
					else
						c.fill({ color: c3, opacity: ratio * 0.9 });

				c.animate(this.appearDuration, '>').radius(size / 2);

				if (x - size < minX)
					minX = x - size;

				if (x + size > maxX)
					maxX = x + size;

				if (y - size < minY)
					minY = y - size;

				if (y + size > maxY)
					maxY = y + size;
			}.bind(this));

			this.svg.viewbox(minX, minY, Math.abs(minX) + maxX, Math.abs(minY) + maxY);
		}
		else
		{
			// special case single or no passage

			if (this.parent.passages.length == 1)
			{
				this.svg.circle().center(5, 5).fill('hsl(' + this.hue + ', 88%, 40%)').animate(this.appearDuration, '>').radius(2.5);
				this.svg.viewbox(0, 0, 10, 10);
			};
		};

		this.passagesRendered = true;

		if (callback)
			callback();
	}
});

module.exports = Preview;

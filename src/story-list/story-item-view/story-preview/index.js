/**
 This class generates SVG previews of stories.
 @class StoryItemView.Preview
**/

'use strict';
const _ = require('underscore');
const Vue = require('vue');
const SVG = require('svg.js');

/**
 How fast we animate passages appearing, in milliseconds.
 @property appearDuration
 @static
**/

const appearDuration = 500;

module.exports = Vue.extend({

	template: "<div class='preview'></div>",

	data: () => ({}),

	props: {
		hue: Number,
		passages: Array,
	},

	compiled() {
		const svg = SVG(this.$el);

		if (this.passages.length > 1) {
			// find longest passage

			let maxLength = 0;

			_.each(this.passages, passage => {
				const len = passage.get('text').length;

				if (len > maxLength) {
					maxLength = len;
				}
			});

			// render passages

			const c1 = 'hsl(' + this.hue + ', 88%, 40%)';
			const c2 = 'hsl(' + ((this.hue - 30) % 360) + ', 88%, 40%)';
			const c3 = 'hsl(' + ((this.hue + 30) % 360) + ', 88%, 40%)';

			let minX = Number.POSITIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxX = Number.NEGATIVE_INFINITY;
			let maxY = Number.NEGATIVE_INFINITY;

			_.each(this.passages, (passage, i) => {
				const ratio = passage.get('text').length / maxLength;
				const size = 100 + 200 * ratio;
				const x = passage.get('left');
				const y = passage.get('top');
				const c = svg.circle().center(x + 50, y + 50);

				if (i % 3 === 0) {
					c.fill({ color: c1, opacity: ratio * 0.9 });
				}
				else {
					if (i % 2 === 0) {
						c.fill({ color: c2, opacity: ratio * 0.9 });
					}
					else {
						c.fill({ color: c3, opacity: ratio * 0.9 });
					}
				}

				c.animate(appearDuration, '>').radius(size / 2);

				if (x - size < minX) { minX = x - size; }

				if (x + size > maxX) { maxX = x + size; }

				if (y - size < minY) { minY = y - size; }

				if (y + size > maxY) { maxY = y + size; }
			});

			svg.viewbox(
				minX,
				minY,
				Math.abs(minX) + maxX,
				Math.abs(minY) + maxY
			);
		}
		else {
			// special case single or no passage

			if (this.passages.length == 1) {
				svg
					.circle()
					.center(5, 5)
					.fill('hsl(' + this.hue + ', 88%, 40%)')
					.animate(appearDuration, '>')
					.radius(2.5);
				svg.viewbox(0, 0, 10, 10);
			}
		}
	}
});

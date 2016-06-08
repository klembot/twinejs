/**
 This class generates SVG previews of stories.
 @class StoryItemView.Preview
**/

'use strict';
const _ = require('underscore');
const Vue = require('vue');
const SVG = require('svg.js');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		edit: Function,
		hue: Number,
		passages: Array,
	},

	computed: {
		style() {
			return {
				background:
					`linear-gradient(
						to bottom,
						hsl(${(this.hue - 20) % 360}, 80%, 95%),
						hsl(${this.hue}, 70%, 85%)
					)`
			};
		},

		passageColor() {
			return `hsla(${this.hue}, 90%, 50%, 0.5)`;
		}
	},

	ready() {
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

			let minX = Number.POSITIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxX = Number.NEGATIVE_INFINITY;
			let maxY = Number.NEGATIVE_INFINITY;

			_.each(this.passages, (passage, i) => {
				const ratio = passage.get('text').length / maxLength;
				const radius = (200 + 200 * ratio) / 2;
				const x = passage.get('left') + 50;
				const y = passage.get('top') + 50;
				const c = svg.circle()
					.center(x, y)
					.radius(radius)
					.fill(this.passageColor);

				if (x - radius < minX) { minX = x - radius; }

				if (x + radius > maxX) { maxX = x + radius; }

				if (y - radius < minY) { minY = y - radius; }

				if (y + radius > maxY) { maxY = y + radius; }
			});

			svg.viewbox(minX, minY, maxX - minX, maxY - minY);
		}
		else {
			// special case single or no passage

			if (this.passages.length == 1) {
				svg
					.circle()
					.center(5, 5)
					.fill(this.passageColor)
					.radius(2.5);
				svg.viewbox(0, 0, 10, 10);
			}
		}
	}
});

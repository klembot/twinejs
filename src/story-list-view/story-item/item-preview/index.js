/**
 This class generates SVG previews of stories.
 @class StoryItemView.Preview
**/

'use strict';
const Vue = require('vue');
const SVG = require('svg.js');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		edit: {
			type: Function,
			required: true
		},
		hue: {
			type: Number,
			required: true
		},
		passages: {
			type: Array,
			required: true
		}
	},

	computed: {
		style() {
			return {
				background: `hsl(${this.hue}, 60%, 95%)`
			};
		},

		passageStroke() {
			return `hsl(${this.hue}, 90%, 45%)`;
		},

		passageFill() {
			return `hsla(${this.hue}, 90%, 60%, 0.5)`;
		}
	},

	ready() {
		const svg = SVG(this.$el);

		if (this.passages.length > 1) {
			// find longest passage

			let maxLength = 0;

			this.passages.forEach(passage => {
				const len = passage.text.length;

				if (len > maxLength) {
					maxLength = len;
				}
			});

			// render passages

			let minX = Number.POSITIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxX = Number.NEGATIVE_INFINITY;
			let maxY = Number.NEGATIVE_INFINITY;

			this.passages.forEach(passage => {
				const ratio = passage.text.length / maxLength;
				const radius = (200 + 200 * ratio) / 2;
				const x = passage.left + 50;
				const y = passage.top + 50;

				svg.circle()
					.center(x, y)
					.radius(radius)
					.fill(this.passageFill)
					.stroke({ color: this.passageStroke, width: 4 });

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
					.center(100, 100)
					.fill(this.passageFill)
					.stroke({ color: this.passageStroke, width: 1 })
					.radius(75);
				svg.viewbox(0, 0, 200, 200);
			}
		}
	}
});

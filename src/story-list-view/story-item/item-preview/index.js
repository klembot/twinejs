/**
 This class generates SVG previews of stories.
 @class StoryItemView.Preview
**/

'use strict';
const Vue = require('vue');

const passageCenterOffset = 50;

function passageRadius(length, longestLength) {
	return (200 + 200 * (length / longestLength)) / 2;
}

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
		},

		longestPassageLength() {
			let maxLength = 0;
			
			this.passages.forEach(passage => {
				const len = passage.text.length;

				if (len > maxLength) {
					maxLength = len;
				}
			});
			
			return maxLength;
		},

		svg() {
			if (this.passages.length <= 1) {
				return `<circle cx="100" cy="100" r="75" fill="${this.passageFill}"
					stroke="${this.passageStroke}" stroke-width="1px" />`;
			}

			return this.passages.reduce(
				(result, p) =>
					result + `<circle cx="${p.left + passageCenterOffset}"
						cy="${p.top + passageCenterOffset}"
						r="${passageRadius(p.text.length, this.longestPassageLength)}"
						fill="${this.passageFill}"
						stroke="${this.passageStroke}"
						stroke-width="4px" />`
				,
				''
			);
		},

		svgViewBox() {
			if (this.passages.length <= 1) {
				return '0 0 200 200';
			}

			let minX = Number.POSITIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxX = Number.NEGATIVE_INFINITY;
			let maxY = Number.NEGATIVE_INFINITY;
			
			this.passages.forEach(p => {
				const x = p.left + passageCenterOffset;
				const y = p.top + passageCenterOffset;
				const radius = passageRadius(
					p.text.length,
					this.longestPassageLength
				);

				if (x - radius < minX) { minX = x - radius; }
				
				if (x + radius > maxX) { maxX = x + radius; }

				if (y - radius < minY) { minY = y - radius; }

				if (y + radius > maxY) { maxY = y + radius; }
			});

			return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
		}
	}
});

<template>
	<button class="story-preview" @click="onClick" :style="style">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			:view-box.camel="svgViewBox"
			v-html="svg"
		/>
	</button>
</template>

<script>
import './story-preview.less';

function passageRadius(length, longestLength) {
	return (200 + 200 * (length / longestLength)) / 2;
}

export default {
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
			return this.passages.reduce((result, current) => {
				if (current.text.length > result) {
					return current.text.length;
				}

				return result;
			}, 0);
		},
		svg() {
			if (this.passages.length <= 1) {
				return `<circle cx="100" cy="100" r="75" fill="${this.passageFill}"
					stroke="${this.passageStroke}" stroke-width="1px" />`;
			}

			return this.passages.reduce(
				(result, p) =>
					result +
					`<circle cx="${p.left + p.width / 2}"
						cy="${p.top + p.height / 2}"
						r="${passageRadius(p.text.length, this.longestPassageLength)}"
						fill="${this.passageFill}"
						stroke="${this.passageStroke}"
						stroke-width="4px" />`,
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
				const x = p.left + p.width / 2;
				const y = p.top + p.height / 2;
				const radius = passageRadius(p.text.length, this.longestPassageLength);

				if (x - radius < minX) {
					minX = x - radius;
				}

				if (x + radius > maxX) {
					maxX = x + radius;
				}

				if (y - radius < minY) {
					minY = y - radius;
				}

				if (y + radius > maxY) {
					maxY = y + radius;
				}
			});

			return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
		}
	},
	methods: {
		onClick() {
			this.$emit('click');
		}
	},
	name: 'story-preview',
	props: {
		hue: {type: Number, required: true},
		passages: {type: Array, required: true}
	}
};
</script>

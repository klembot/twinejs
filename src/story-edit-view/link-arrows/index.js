// Displays SVG arrows showing links between <passage-item> components.

const SVG = require('svg.js');
const Vue = require('vue');
const _ = require('underscore');
const lineclip = require('lineclip');

// The angle at which arrowheads are drawn, in radians.

const ARROW_ANGLE = Math.PI / 6;

// The length of arrowheads, in pixels.

const ARROW_SIZE = 10;

module.exports = Vue.extend({
	template: '<div class="links"></div>',

	props: {
		// An array of connector link objects.

		links: {
			type: Object,
			required: true
		},

		// Whether to draw arrowheads.
		
		arrowheads: {
			type: Boolean,
			default: true
		}
	},

	ready() {
		this.$svg = SVG(this.$el);

		// Cache used to store SVG lines that should be preserved between ticks.
		this.cache = {};
		Vue.nextTick(() => this.draw());
	},

	watch: {
		'links': 'draw',
		'arrowheads': 'draw'
	},

	methods: {
		draw() {
			const newCache = {};

			_.values(this.links).forEach(from => {
				from.links.forEach((toName) => {
					const to = this.links[toName];

					// If the destination passage doesn't exist,
					// or is equal to the other passage, don't draw it.

					if (!to || to === from) {
						return;
					}

					// The initial line, which will be clipped.
					// This deep-copies from.center and to.center, so that
					// they aren't mutated.
					let fullLine = [[...from.center], [...to.center]];

					// The SVG element that will be produced.
					let svgLine;

					// Check the cache to see if an SVG element for this line
					// is already available.
					// Note: this assumes passages can never change size only,
					// in a single tick.
					const cacheIndex = fullLine + '';

					if (cacheIndex + '' in this.cache) {
						svgLine = this.cache[cacheIndex];
					}
					else {
						// We must create a clipped line from the fullLine.
						let line;

						// Tweak to make overlapping lines easier to see by
						// shifting each end point by a certain amount.
						let lengthSquared =
							Math.pow(from.center[0] - to.center[0], 2) +
							Math.pow(from.center[1] - to.center[1], 2);
						// Reduction by a large constant keeps the shifting from being
						// noticeable while dragging passages.
						lengthSquared /= 524288;
						fullLine = fullLine.map(e => {
							const width = (from.box[2] - from.box[0]) / 4;

							e[0] += (0.5 - Math.cos(lengthSquared)) * width;
							e[1] += (0.5 - Math.sin(lengthSquared)) * width;
							return e.map(Math.round);
						});

						// Clip by the starting passage's box, extract the point that intersected
						// the line (which is always the second of the returned pair),
						// and add it to the line.
						let clippedStart, clippedEnd;

						[[,clippedStart]=[]] = lineclip(fullLine, from.box);
						// and repeat for the destination passage's box.
						// (reverse() can't be used, as it changes the array in-place.)
						[[,clippedEnd]=[]] = lineclip([fullLine[1], fullLine[0]], to.box);

						if (!clippedStart || !clippedEnd) {
							return;
						}

						line = [clippedStart, clippedEnd];

						// We now add arrowheads if requested.
						if (this.arrowheads) {
							const head1 = this.endPointProjectedFrom(
								line,
								ARROW_ANGLE,
								ARROW_SIZE
							);
							const head2 = this.endPointProjectedFrom(
								line,
								-ARROW_ANGLE,
								ARROW_SIZE
							);

							line.push(head1, [line[1][0], line[1][1]], head2);
						}
						// Now create an SVG element from it.
						svgLine = this.$svg.polyline(line);
					}

					// Add the SVG line to the new cache
					newCache[cacheIndex] = svgLine;
				});
			});
			// Remove all other existing lines which aren't present in the new cache.
			_.difference(
				_.values(this.cache),
				_.values(newCache)).forEach(e => e.remove()
			);

			// Replace the cache with the new one.
			this.cache = newCache;
		},

		// Projects a point from the endpoint of a line at a certain angle and
		// distance.

		endPointProjectedFrom(line, angle, distance) {
			// Find the length of the original line with the Pythagorean theorem.

			const length = Math.sqrt(
				Math.pow(line[1][0] - line[0][0], 2) +
				Math.pow(line[1][1] - line[0][1], 2)
			);

			if (length === 0) {
				return line[1];
			}

			// Calculate the endpoint.
			// Taken from http://mathforum.org/library/drmath/view/54146.html

			const lengthRatio = distance / length;

			const x = line[1][0] - ((line[1][0] - line[0][0]) * Math.cos(angle) -
				(line[1][1] - line[0][1]) * Math.sin(angle)) * lengthRatio;
			const y = line[1][1] - ((line[1][1] - line[0][1]) * Math.cos(angle) +
				(line[1][0] - line[0][0]) * Math.sin(angle)) * lengthRatio;

			return [x, y];
		}
	}
});

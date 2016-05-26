// Displays SVG arrows showing links between <passage-item> components.
// This could be optimized quite a bit.

const SVG = require('svg.js');
const Vue = require('vue');

// The angle at which arrowheads are drawn, in radians.

const ARROW_ANGLE = Math.PI / 6;

// The length of arrowheads, in pixels.

const ARROW_SIZE = 10;

module.exports = Vue.extend({
	template: '<div class="links"></div>',

	props: [
		'links',     // An array of connector links objects
		'arrowheads' // Boolean: whether to draw arrowheads
	],

	ready() {
		this.$svg = SVG(this.$el);
		Vue.nextTick(() => this.draw());
	},

	watch: {
		'links': 'draw',
		'arrowheads': 'draw'
	},

	methods: {
		draw() {
			this.$svg.clear();

			Object.keys(this.links).forEach((fromName) => {
				const from = this.links[fromName];

				from.links.forEach((toName) => {
					const to = this.links[toName];

					// If the destination passage doesn't exist,
					// or is equal to the other passage, don't draw it.

					if (!to || to === from) {
						return;
					}

					// The points in the line we'll draw.

					let line;

					// Find the closest sides to connect between the two.
					// In all the following code, we are working with [x, y]
					// pairs. See the <passage-item> component for more details
					// on how this property is assembled.

					const xDist = to.n[0] - from.n[0];
					const yDist = to.n[1] - from.n[1];
					const slope = Math.abs(xDist / yDist);

					// If the angle between the two passages isn't very
					// extreme, connect their sides instead of their corners.
					// The numbers in this if statement were eyeballed.

					if (slope < 0.8 || slope > 1.3) {
						// If the line has more horizontal distance to
						// cover, draw it horizontally; otherwise, vertically.

						if (Math.abs(xDist) > Math.abs(yDist)) {
							if (xDist > 0) {
								line = [from.e, to.w];
							}
							else {
								line = [from.w, to.e];
							}
						}
						else {
							if (yDist > 0) {
								line = [from.s, to.n];
							}
							else {
								line = [from.n, to.s];
							}
						}
					}
					else {
						// Connect the corners.

						if (xDist < 0) {
							if (yDist < 0) {
								line = [from.nw, to.se];
							}
							else {
								line = [from.sw, to.ne];
							}
						}
						else {
							if (yDist < 0) {
								line = [from.ne, to.sw];
							}
							else {
								line = [from.se, to.nw];
							}
						}
					}

					// `line` is now an array of two points: 0 is the start, 1 is
					// the end. We now add arrowheads if requested.

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

					// Finally, draw it.

					this.$svg.polyline(line);
				});
			});
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

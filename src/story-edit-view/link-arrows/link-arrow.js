const Vue = require('vue');

/*
Renders an SVG Bezier curve with two points. Expects an object with start,
startControl, end, and endControl properties.

Recommended reading:
https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Curve_commands
*/

function bezierCurve(points) {
	const { start, startControl, end, endControl } = points;

	return 'M' + start.x + ',' + start.y +
		' C' + startControl.x + ',' + startControl.y +
		' ' + endControl.x + ',' + endControl.y +
		' ' + end.x + ',' + end.y;
}

/*
Renders an SVG quadratic curve. This expects an object with start, control, and
end properties.
*/

function quadCurve(points) {
	const { start, control, end } = points;

	return 'M' + start.x + ',' + start.y +
		' Q' + control.x + ',' + control.y +
		' ' + end.x + ',' + end.y;
}

/*
Renders an SVG arc. This expects an object with start, radius, largeArc,
xRotation, sweep, and end properties.
*/

function arc(props) {
	const { start, radius, end, largeArc, sweep, xRotation } = props;
	
	return 'M' + start.x + ',' + start.y +
		' A' + radius.x + ',' + radius.y +
		(xRotation ? ' 1' : ' 0') +
		(largeArc ? ' 1' : ' 0') +
		(sweep ? ' 1 ' : ' 0 ') +
		end.x + ',' + end.y;
}

module.exports = Vue.extend({
	template: '<path :d="pathString" class="marker-{{markerType}}"></path>',

	props: {
		/*
		The possible anchor points to use as the start of this connector. This
		should have top, left, right, and bottom properties, each an (x, y)
		array.
		*/

		start: {
			type: Object,
			required: true
		},

		/*
		The possible anchor points to use as the end of this connector. This
		should have top, left, right, and bottom properties, each an (x, y)
		array.
		
		It's OK for this to be null or undefined; in those cases, we draw a
		broken link indicator.
		*/

		end: {
			type: Object,
			required: false
		}
	},

	computed: {
		/*
		The marker to use at the end of the line, usually an arrowhead.
		*/

		markerType() {
			const { start, end } = this;
			
			if (!start) {
				console.warn('Start position has no anchor points');
				return;
			}
			
			/* Special case self-links. */
			
			if (start === end) {
				return 'down';
			}

			/* Special case broken links. */

			if (!end) {
				return 'broken';
			}

			/*
			We pick the direction based on the largest distance we have to
			travel.
			*/

			const horizDist = Math.abs(start.left.x - end.left.x);
			const vertDist = Math.abs(start.top.y - end.top.y);

			if (horizDist > vertDist) {
				return (start.left.x < end.left.x) ? 'right' : 'left';
			}

			return (start.top.y < end.top.y) ? 'down' : 'up';
		},

		/*
		The actual SVG path d attribute that will be drawn onscreen.

		The curves are designed to smoothly transition from tangents to the
		center of the chosen sides, with some artificial curve introduced to
		avoid completely straight lines.

		In the case of (nearly) completely horizontal or vertical lines, we
		introduce an artificial curve to the line with a quadratic curve. This
		is to keep multiple lines from the same anchor point from overlapping.
		*/

		pathString() {
			const { start, end } = this;

			/*
			The amount of space we should leave when drawing to an endpoint so
			that the arrowhead shows correctly, in pixels. We can't just move
			the marker back on the line, because it will look oddly aligned at
			severe angles.

			The SVG definition of the arrowhead is in this module's index.html.
			*/

			const ARROWHEAD_SPACE = 12;

			/*
			The amount of pixels we consider to be close enough variation to be
			treated as a straight line.
			*/

			const FLAT_TOLERANCE = 10;

			/*
			The amount of curve we introduce to flat lines, as a proportion of
			the line length. Note that signs are varied below so that cyclical
			links between two passages are more obvious-- instead of one line,
			it will show as two.
			*/

			const FLAT_WIGGLE = 0.25;

			/*
			Special case self-links to draw an arc from the left anchor to the
			top.
			*/
			
			if (start === end) {
				return arc({
					start: start.left,
					end: {
						x: end.top.x,
						y: end.top.y - ARROWHEAD_SPACE
					},
					radius: {
						x: 0.4 * (start.right.x - start.left.x),
						y: 0.4 * (end.bottom.y - end.top.y)
					},
					sweep: true,
					largeArc: true
				});
			}
			
			/*
			Special case broken links to show a short curve.
			*/
			
			if (!end) {
				return quadCurve({
					start: start.right,
					end: {
						x: start.right.x + (start.right.x - start.left.x) / 2,
						y: start.bottom.y
					},
					control: {
						x: start.right.x + (start.right.x - start.left.x) / 2,
						y: start.right.y + (start.bottom.y - start.top.y) / 8
					}
				});
			}

			/*
			The control distance is half the distance the arrow will travel.
			*/

			let controlDist;

			switch (this.markerType) {
				case 'right':
					/*
					Draw left to right.
					That is, the start's right side to the end's left side.
					*/

					controlDist = (end.left.x - start.right.x - ARROWHEAD_SPACE)
						/ 2;

					if (Math.abs(start.top.y - end.top.y) < FLAT_TOLERANCE) {
						return quadCurve({
							start: start.right,
							end: {
								x: end.left.x - ARROWHEAD_SPACE,
								y: end.left.y
							},
							control: {
								x: start.right.x + controlDist,
								y: end.left.y - controlDist * FLAT_WIGGLE
							}
						});
					}

					return bezierCurve({
						start: start.right,
						startControl: {
							x: start.right.x + controlDist,
							y: start.right.y
						},
						end: {
							x: end.left.x - ARROWHEAD_SPACE,
							y: end.left.y
						},
						endControl: {
							x: end.left.x - ARROWHEAD_SPACE - controlDist,
							y: end.left.y
						}
					});

				case 'left':
					/*
					Draw right to left.
					That is, the start's left side to the end's right side.
					*/

					controlDist = (start.left.x - end.right.x - ARROWHEAD_SPACE)
						/ 2;

					if (Math.abs(end.top.y - start.top.y) < FLAT_TOLERANCE) {
						return quadCurve({
							start: start.left,
							end: {
								x: end.right.x + ARROWHEAD_SPACE,
								y: end.right.y
							},
							control: {
								x: start.left.x - controlDist,
								y: start.left.y + controlDist * FLAT_WIGGLE
							}
						});
					}

					return bezierCurve({
						start: start.left,
						startControl: {
							x: start.left.x - controlDist,
							y: start.left.y
						},
						end: {
							x: end.right.x + ARROWHEAD_SPACE,
							y: end.right.y
						},
						endControl: {
							x: end.right.x + controlDist,
							y: end.right.y
						}
					});

				case 'down':
					/*
					Draw top to bottom.
					That is, the start's bottom side to the end's top side.
					*/

					controlDist = (end.top.y - start.bottom.y - ARROWHEAD_SPACE)
						/ 2;

					if (Math.abs(start.left.x - end.left.x) < FLAT_TOLERANCE) {
						return quadCurve({
							start: start.bottom,
							end: {
								x: end.top.x,
								y: end.top.y - ARROWHEAD_SPACE
							},
							control: {
								x: start.bottom.x + controlDist * FLAT_WIGGLE,
								y: start.bottom.y + controlDist
							}
						});
					}

					return bezierCurve({
						start: start.bottom,
						startControl: {
							x: start.bottom.x,
							y: start.bottom.y + controlDist
						},
						end: {
							x: end.top.x,
							y: end.top.y - ARROWHEAD_SPACE
						},
						endControl: {
							x: end.top.x,
							y: end.top.y - controlDist
						}
					});

				case 'up':
					/*
					Draw bottom to top.
					That is, the start's top side to the end's bottom side.
					*/

					controlDist = (start.top.y - end.bottom.y - ARROWHEAD_SPACE)
						/ 2;

					if (Math.abs(start.left.x - end.left.x) < FLAT_TOLERANCE) {
						return quadCurve({
							start: start.top,
							end: {
								x: end.bottom.x,
								y: end.bottom.y + ARROWHEAD_SPACE
							},
							control: {
								x: start.top.x - controlDist * FLAT_WIGGLE,
								y: start.top.y - controlDist
							}
						});
					}

					return bezierCurve({
						start: start.top,
						startControl: {
							x: start.top.x,
							y: start.top.y - controlDist
						},
						end: {
							x: end.bottom.x,
							y: end.bottom.y + ARROWHEAD_SPACE
						},
						endControl: {
							x: end.bottom.x,
							y: end.bottom.y + controlDist
						}
					});
			}
		}
	}
});

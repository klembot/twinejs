const Vue = require('vue');
const rect = require('../../common/rect');

/*
Renders an SVG arc. This expects an object with start, radius, largeArc,
rotation, sweep, and end properties.
*/

function arc(props) {
	const { start, radius, end, largeArc, sweep, rotation } = props;
	
	return 'M' + start.left + ',' + start.top +
		' A' + radius.x + ',' + radius.y +
		' ' + (rotation || '0') +
		(largeArc ? ' 1' : ' 0') +
		(sweep ? ' 1 ' : ' 0 ') +
		end.left + ',' + end.top;
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

			/* Special case broken links. */

			if (!end) {
				return 'broken';
			}

			return 'arrow';
		},

		/*
		The actual SVG path d attribute that will be drawn onscreen. For self
		links, we draw a circle pointing back ath the start; for broken links,
		a short arrow drooping down and to the right.

		For normal links between passages, we connect the two closest points
		between the passage sides (as determined by finding intersections with
		the rectangles with a line drawn from center to center). We draw this
		with a flattened arc, to make it easier to distinguish between links
		between passages with the same horizontal or vertical position (which
		would otherwise be overlapping flat lines).
		*/

		pathString() {
			const { start, end } = this;

			/*
			Special case self-links to draw an arc from the left anchor to the
			top.
			*/
			
			if (start === end) {
				const radius = 0.4 * Math.min(start.width, start.height);

				return arc({
					start: {
						left: start.left,
						top: start.top + start.height / 2
					},
					end: {
						left: end.left,
						top: end.top
					},
					radius: {
						x: radius,
						y: radius
					},
					sweep: true,
					largeArc: true
				});
			}
			
			/*
			Special case broken links to show a short arc down.
			*/
			
			if (!end) {
				return arc({
					start: {
						left: start.left + start.width,
						top: start.top + start.height / 2
					},
					end: {
						left: start.left + start.width * 1.5,
						top: start.top + start.height
					},
					radius: {
						x: start.width / 2,
						y: start.height / 2
					},
					sweep: true
				});
			}
			
			/*
			Find the start and end points to draw.
			*/

			let startPt = {
				left: start.left + start.width / 2,
				top: start.top + start.height / 2
			};
			let endPt = {
				left: end.left + end.width / 2,
				top: end.top + end.height / 2
			};

			endPt = rect.intersectionWithLine(end, startPt, endPt);
			/*
			intersectionWithLine can return undefined if the other passage is
			overlapping this passage (such as when it's being dragged over).
			In that case, return no path.
			*/
			if (!endPt) {
				return '';
			}

			startPt = rect.intersectionWithLine(start, startPt, endPt);
			if (!startPt) {
				return '';
			}

			/*
			The horizontal radius of our arc is proportional to the distance
			the line will travel.
			*/

			const lineDist = Math.sqrt(
				Math.pow(startPt.left - endPt.left, 2) +
				Math.pow(startPt.top - endPt.top, 2)
			);

			/*
			Rotate the arc so that its underside will always face downward.
			We cheat vertical lines so that their undersides face right -- an
			aesthetic choice, and so that bidirectional links line up.
			*/

			let sweep = startPt.left < endPt.left;

			if (startPt.left === endPt.left && startPt.top < endPt.top) {
				sweep = true;
			}

			/*
			The arc will be rotated to match the angle of the line. Here, zero
			degrees indicates the arc runs horizontally left to right. This
			formula is taken from https://gist.github.com/conorbuck/2606166 --
			unfortunately for this use case, SVG requires degrees, not radians.
			*/

			const lineAngle = Math.atan2(
				endPt.top - startPt.top,
				endPt.left - startPt.left
			) * 180 / Math.PI;

			/*
			The Y radius is another aesthetic choice. The lower the ratio, the
			less curved the lines become.
			*/

			return arc({
				start: startPt,
				end: endPt,
				radius: {
					x: lineDist,
					y: lineDist * 0.75
				},
				rotation: lineAngle,
				sweep
			});
		}
	}
});

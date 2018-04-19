// Utility functions for dealing with rectangles. These always expect
// rectangles to be specified as objects with { top, left, width, height }
// properties.

const segseg = require('segseg');

module.exports = {
	// Returns whether two rectangles intersect.
	// http://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection

	intersects(r1, r2) {
		return !(r2.left > r1.left + r1.width ||
			r2.left + r2.width < r1.left ||
			r2.top > r1.top + r1.height ||
			r2.top + r2.height < r1.top);
	},

	// Returns the intersection point between a rectangle and a line segment.
	// If none exists, this returns null.

	intersectionWithLine(rect, segmentStart, segmentEnd) {
		let result;

		// Left side.

		result = segseg(
			rect.left,
			rect.top,
			rect.left,
			rect.top + rect.height,
			segmentStart.left,
			segmentStart.top,
			segmentEnd.left,
			segmentEnd.top
		);

		if (result && result.length) {
			return {
				left: result[0],
				top: result[1]
			};
		}

		// Right side.

		result = segseg(
			rect.left + rect.width,
			rect.top,
			rect.left + rect.width,
			rect.top + rect.height,
			segmentStart.left,
			segmentStart.top,
			segmentEnd.left,
			segmentEnd.top
		);

		if (result && result.length) {
			return {
				left: result[0],
				top: result[1]
			};
		}

		// Top side.

		result = segseg(
			rect.left,
			rect.top,
			rect.left + rect.width,
			rect.top,
			segmentStart.left,
			segmentStart.top,
			segmentEnd.left,
			segmentEnd.top
		);

		if (result && result.length) {
			return {
				left: result[0],
				top: result[1]
			};
		}

		// Bottom side.

		result = segseg(
			rect.left,
			rect.top + rect.height,
			rect.left + rect.width,
			rect.top + rect.height,
			segmentStart.left,
			segmentStart.top,
			segmentEnd.left,
			segmentEnd.top
		);

		if (result && result.length) {
			return {
				left: result[0],
				top: result[1]
			};
		}

		return;
	},

	// Displaces a rectangle so that it does not intersect rectangle (with
	// optional spacing), moving it the least amount of distance along one axis
	// possible.

	displace(movable, stationary, spacing = 0) {
		const sLeft = stationary.left - spacing;
		const sRight = sLeft + stationary.width + spacing * 2;
		const sTop = stationary.top - spacing;
		const sBottom = sTop + stationary.height + spacing * 2;
		const mLeft = movable.left - spacing;
		const mRight = mLeft + movable.width + spacing * 2;
		const mTop = movable.top - spacing;
		const mBottom = mTop + movable.height + spacing * 2;

		// Calculate the amount of overlap along each axis.
		// This is cribbed from
		// http://frey.co.nz/old/2007/11/area-of-two-rectangles-algorithm/

		const xOverlap = Math.min(sRight, mRight) - Math.max(sLeft, mLeft);
		const yOverlap = Math.min(sBottom, mBottom) - Math.max(sTop, mTop);

		// Decide whether moving left or right would resolve the overlap with
		// the least motion.

		let xChange = 0;
		let yChange = 0;

		if (xOverlap !== 0) {
			const leftMove = (mLeft - sLeft) + movable.width + spacing * 2;
			const rightMove = sRight - mLeft;

			if (leftMove < rightMove) {
				xChange = -leftMove;
			}
			else {
				xChange = rightMove;
			}
		}

		// Same as above, but with vertical overlap.

		if (yOverlap !== 0) {
			const upMove = (mTop - sTop) + movable.height + spacing * 2;
			const downMove = sBottom - mTop;

			if (upMove < downMove) {
				yChange = -upMove;
			}
			else {
				yChange = downMove;
			}
		}

		// Choose the option that moves the rect the least.

		if (Math.abs(xChange) > Math.abs(yChange)) {
			movable.top += yChange;
		}
		else {
			movable.left += xChange;
		}
	}
};

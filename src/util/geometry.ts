import segseg, {SegSegVector} from 'segseg';

export interface Point {
	top: number;
	left: number;
}

export interface Rect extends Point {
	height: number;
	width: number;
}

/**
 * Returns the angle between two points in degrees.
 * @see https://gist.github.com/conorbuck/2606166
 */
export function lineAngle(p1: Point, p2: Point) {
	return (Math.atan2(p2.top - p1.top, p2.left - p1.left) * 180) / Math.PI;
}

/**
 * Returns the length of the line segment between two points.
 */
export function lineDistance(p1: Point, p2: Point) {
	return Math.hypot(p1.left - p2.left, p1.top - p2.top);
}

/**
 * Returns the center of a rectangle.
 */
export function rectCenter(rect: Rect): Point {
	return {left: rect.left + rect.width / 2, top: rect.top + rect.height / 2};
}

/**
 * Creates a rectangle from two points, regardless of their relative position.
 */

export function rectFromPoints(p1: Point, p2: Point): Rect {
	const rect: Rect = {height: 0, left: 0, top: 0, width: 0};

	if (p1.left < p2.left) {
		rect.left = p1.left;
		rect.width = p2.left - p1.left;
	} else {
		rect.left = p2.left;
		rect.width = p1.left - p2.left;
	}

	if (p1.top < p2.top) {
		rect.top = p1.top;
		rect.height = p2.top - p1.top;
	} else {
		rect.top = p2.top;
		rect.height = p1.top - p2.top;
	}

	return rect;
}

/**
 * Returns whether two rectangles intersect.
 * @see http://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
 */
export function rectsIntersect(r1: Rect, r2: Rect) {
	return !(
		r2.left > r1.left + r1.width ||
		r2.left + r2.width < r1.left ||
		r2.top > r1.top + r1.height ||
		r2.top + r2.height < r1.top
	);
}

/**
 * Returns the intersection point between a rectangle and a line segment. If
 * none exists, this returns null.
 */
export function rectIntersectionWithLine(
	rect: Rect,
	segmentStart: Point,
	segmentEnd: Point
): Point | null {
	let result: SegSegVector = [NaN, NaN];

	// Left side.

	if (
		segseg(
			result,
			[rect.left, rect.top],
			[rect.left, rect.top + rect.height],
			[segmentStart.left, segmentStart.top],
			[segmentEnd.left, segmentEnd.top]
		)
	) {
		return {
			left: result[0],
			top: result[1]
		};
	}

	// Right side.

	if (
		segseg(
			result,
			[rect.left + rect.width, rect.top],
			[rect.left + rect.width, rect.top + rect.height],
			[segmentStart.left, segmentStart.top],
			[segmentEnd.left, segmentEnd.top]
		)
	) {
		return {
			left: result[0],
			top: result[1]
		};
	}

	// Top side.

	if (
		segseg(
			result,
			[rect.left, rect.top],
			[rect.left + rect.width, rect.top],
			[segmentStart.left, segmentStart.top],
			[segmentEnd.left, segmentEnd.top]
		)
	) {
		return {
			left: result[0],
			top: result[1]
		};
	}

	// Bottom side.

	if (
		segseg(
			result,
			[rect.left, rect.top + rect.height],
			[rect.left + rect.width, rect.top + rect.height],
			[segmentStart.left, segmentStart.top],
			[segmentEnd.left, segmentEnd.top]
		)
	) {
		return {
			left: result[0],
			top: result[1]
		};
	}

	return null;
}

/**
 * Returns a rectangle enclosing a set of rectangles.
 */
export function boundingRect(rects: Rect[]) {
	if (rects.length === 0) {
		throw new Error("Can't calculate bounding rect for 0 rects");
	}

	const result = {...rects[0]};

	for (let i = 1; i < rects.length; i++) {
		const right = rects[i].left + rects[i].width;
		const bottom = rects[i].top + rects[i].height;

		if (rects[i].left < result.left) {
			result.left = rects[i].left;
		}

		if (rects[i].top < result.top) {
			result.top = rects[i].top;
		}

		if (result.left + result.width < right) {
			result.width = right - result.left;
		}

		if (result.top + result.height < bottom) {
			result.height = bottom - result.top;
		}
	}

	return result;
}

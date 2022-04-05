import {
	boundingRect,
	lineAngle,
	lineDistance,
	rectCenter,
	rectFromPoints,
	rectIntersectionWithLine,
	rectsIntersect
} from '../geometry';

describe('lineAngle()', () => {
	it('returns the angle between two points in degrees', () => {
		expect(lineAngle({left: 0, top: 0}, {left: 1, top: 1})).toBe(45);
		expect(lineAngle({left: 5, top: 5}, {left: 10, top: 10})).toBe(45);
		expect(lineAngle({left: 5, top: 5}, {left: -10, top: -10})).toBe(-135);
	});

	it('returns 90 for upward vertical lines', () => {
		expect(lineAngle({left: 0, top: 0}, {left: 0, top: 1})).toBe(90);
		expect(lineAngle({left: 5, top: 5}, {left: 5, top: 10})).toBe(90);
	});

	it('returns -90 for downward vertical lines', () => {
		expect(lineAngle({left: 0, top: 1}, {left: 0, top: 0})).toBe(-90);
		expect(lineAngle({left: 5, top: 10}, {left: 5, top: 5})).toBe(-90);
	});

	it('returns 0 for rightward horizontal lines', () => {
		expect(lineAngle({left: 0, top: 0}, {left: 1, top: 0})).toBe(0);
		expect(lineAngle({left: 5, top: 5}, {left: 10, top: 5})).toBe(0);
	});

	it('returns 180 for leftward horizontal lines', () => {
		expect(lineAngle({left: 0, top: 0}, {left: -1, top: 0})).toBe(180);
		expect(lineAngle({left: 5, top: 5}, {left: -10, top: 5})).toBe(180);
	});

	it('returns 0 for lines of 0 length', () => {
		expect(lineAngle({left: 0, top: 0}, {left: 0, top: 0})).toBe(0);
		expect(lineAngle({left: 5, top: 5}, {left: 5, top: 5})).toBe(0);
	});
});

describe('lineDistance()', () => {
	it('returns the length of a line between two points', () => {
		expect(lineDistance({left: 0, top: 0}, {left: 1, top: 1})).toBeCloseTo(
			Math.sqrt(2)
		);
		expect(lineDistance({left: 0, top: 0}, {left: 5, top: 5})).toBeCloseTo(
			Math.sqrt(50)
		);
		expect(lineDistance({left: 10, top: 10}, {left: 11, top: 11})).toBeCloseTo(
			Math.sqrt(2)
		);
		expect(lineDistance({left: 10, top: 10}, {left: 15, top: 15})).toBeCloseTo(
			Math.sqrt(50)
		);
		expect(
			lineDistance({left: -10, top: -10}, {left: -11, top: -11})
		).toBeCloseTo(Math.sqrt(2));
		expect(
			lineDistance({left: -10, top: -10}, {left: -15, top: -15})
		).toBeCloseTo(Math.sqrt(50));
	});

	it('returns 0 for lines of 0 length', () => {
		expect(lineDistance({left: 0, top: 0}, {left: 0, top: 0})).toBe(0);
		expect(lineDistance({left: 5, top: 5}, {left: 5, top: 5})).toBe(0);
	});
});

describe('rectCenter()', () => {
	it('returns the center of a rectangle', () => {
		expect(rectCenter({top: 10, left: 10, width: 20, height: 20})).toEqual({
			top: 20,
			left: 20
		});
		expect(rectCenter({top: -10, left: -10, width: 20, height: 20})).toEqual({
			top: 0,
			left: 0
		});
	});

	it('returns the point if the rectangle has no size', () => {
		expect(rectCenter({top: 10, left: 10, width: 0, height: 0})).toEqual({
			top: 10,
			left: 10
		});
	});
});

describe('rectFromPoints()', () => {
	it('returns a rectangle from two points', () => {
		expect(rectFromPoints({top: 0, left: 0}, {top: 10, left: 10})).toEqual({
			top: 0,
			left: 0,
			width: 10,
			height: 10
		});
		expect(rectFromPoints({top: 10, left: 10}, {top: 20, left: 20})).toEqual({
			top: 10,
			left: 10,
			width: 10,
			height: 10
		});
	});

	it('returns a zero-size rectangle if given the same point', () => {
		expect(rectFromPoints({top: 0, left: 0}, {top: 0, left: 0})).toEqual({
			top: 0,
			left: 0,
			width: 0,
			height: 0
		});
		expect(rectFromPoints({top: 10, left: 10}, {top: 10, left: 10})).toEqual({
			top: 10,
			left: 10,
			width: 0,
			height: 0
		});
	});
});

describe('rectsIntersect()', () => {
	it('returns true when the rectangles intersect', () => {
		expect(
			rectsIntersect(
				{top: 10, left: 10, width: 20, height: 20},
				{top: 0, left: 0, width: 15, height: 15}
			)
		).toBe(true);
		expect(
			rectsIntersect(
				{top: 3, left: 3, width: 1, height: 1},
				{top: 0, left: 0, width: 15, height: 15}
			)
		).toBe(true);
	});

	it('returns false when the rectangles do not intersect', () => {
		expect(
			rectsIntersect(
				{top: 10, left: 10, width: 20, height: 20},
				{top: 0, left: 0, width: 15, height: 5}
			)
		).toBe(false);
		expect(
			rectsIntersect(
				{top: 3, left: 3, width: 1, height: 1},
				{top: 0, left: 0, width: 15, height: 15}
			)
		).toBe(true);
	});

	it('returns true given the same rectangle', () =>
		expect(
			rectsIntersect(
				{top: 10, left: 10, width: 20, height: 20},
				{top: 10, left: 10, width: 20, height: 20}
			)
		).toBe(true));
});

describe('rectIntersectionWithLine()', () => {
	it('returns the intersection of a rectangle with a point', () => {
		expect(
			rectIntersectionWithLine(
				{top: -20, left: -20, width: 40, height: 40},
				{left: -20, top: 0},
				{left: 50, top: 0}
			)
		).toEqual({left: -20, top: -0}); // weird but true
		expect(
			rectIntersectionWithLine(
				{top: -20, left: -20, width: 40, height: 40},
				{left: 0, top: -50},
				{left: 0, top: 100}
			)
		).toEqual({left: 0, top: -20});
		expect(
			rectIntersectionWithLine(
				{top: -20, left: -20, width: 40, height: 40},
				{left: -50, top: -50},
				{left: 50, top: 50}
			)
		).toEqual({left: -20, top: -20});
	});

	it('returns null if there is no intersection', () =>
		expect(
			rectIntersectionWithLine(
				{top: -20, left: -20, width: 40, height: 40},
				{left: 100, top: 0},
				{left: 200, top: 0}
			)
		).toEqual(null));
});

describe('boundingRect()', () => {
	it('returns a rectangle closing the passed rectangles', () => {
		// Disjunct.
		expect(
			boundingRect([
				{top: -20, left: -20, width: 40, height: 40},
				{top: 30, left: 30, width: 5, height: 5}
			])
		).toEqual({left: -20, top: -20, height: 55, width: 55});

		expect(
			boundingRect([
				{left: 10, top: 10, width: 200, height: 200},
				{top: 0, left: 0, width: 0, height: 0}
			])
		).toEqual({left: 0, top: 0, height: 210, width: 210});

		// Overlapping.
		expect(
			boundingRect([
				{top: -20, left: -20, width: 40, height: 40},
				{top: 10, left: 10, width: 100, height: 100}
			])
		).toEqual({left: -20, top: -20, height: 130, width: 130});

		// One encloses the other.
		expect(
			boundingRect([
				{top: -20, left: -20, width: 40, height: 40},
				{top: 0, left: 0, width: 5, height: 5}
			])
		).toEqual({left: -20, top: -20, height: 40, width: 40});
	});
});

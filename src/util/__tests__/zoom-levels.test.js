import {descriptions, describe as describeZoom} from '../zoom-levels';

const sizes = ['large', 'medium', 'small'];

describe('zoom-levels', () => {
	it('contains large, medium, and small keys in descriptions', () => {
		sizes.forEach(size => {
			expect(typeof descriptions[size]).toBe('number');
		});
	});

	it('correctly describes zoom levels', () => {
		sizes.forEach(size => {
			expect(describeZoom(descriptions[size])).toBe(size);
		});
	});

	it('describes all other values as undefined', () => {
		[0, 'a', 0.9, '1'].forEach(value => {
			expect(describeZoom(value)).toBeUndefined();
		});
	});
});

import {faker} from '@faker-js/faker';
import {colors, colorString, hueString} from '../color';

describe('hueString', () => {
	it('hashes a string to a value between 0 and 360', () => {
		for (let i = 0; i < 50; i++) {
			const hue = hueString(faker.lorem.words());

			expect(hue).toBeLessThan(360);
			expect(hue).toBeGreaterThanOrEqual(0);
		}
	});

	it('hashes deterministically', () =>
		expect(hueString('foo')).toBe(hueString('foo')));
});

describe('colorString', () => {
	it('hashes a string to a color string', () => {
		for (let i = 0; i < 50; i++) {
			expect(colors.includes(colorString(faker.lorem.words()))).toBe(true);
		}
	});

	it('hashes deterministically', () =>
		expect(colorString('foo')).toBe(colorString('foo')));
});

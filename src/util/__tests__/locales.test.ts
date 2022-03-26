import {closestAppLocale} from '../locales';

describe('closestAppLocale()', () => {
	it('returns an exact match if one exists', () => {
		expect(closestAppLocale('en')).toBe('en');
		expect(closestAppLocale('pt-br')).toBe('pt-br');
	});

	it('returns a rough match if one exists', () => {
		expect(closestAppLocale('en-US')).toBe('en');
		expect(closestAppLocale('da-DK')).toBe('da');
	});

	it("returns 'en' as a fallback", () =>
		expect(closestAppLocale('martian')).toBe('en'));
});

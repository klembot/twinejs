import {closestAppLocale} from '../locales';

describe('closestAppLocale()', () => {
	it('returns an exact match if one exists', () => {
		expect(closestAppLocale('fr')).toBe('fr');
		expect(closestAppLocale('pt-br')).toBe('pt-br');
	});

	it('returns a rough match if one exists', () => {
		expect(closestAppLocale('fr-CA')).toBe('fr');
		expect(closestAppLocale('da-DK')).toBe('da');
	});

	it("returns 'en-us' as a fallback", () =>
		expect(closestAppLocale('martian')).toBe('en-us'));
});

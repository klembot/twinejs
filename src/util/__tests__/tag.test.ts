import {isValidTagName} from '../tag';

describe('isValidTagName', () => {
	it('returns false for a tag containing a space', () =>
		expect(isValidTagName('a space')).toBe(false));

	it('returns false for an empty string', () =>
		expect(isValidTagName('')).toBe(false));

	it('returns false for a string of only whitespace', () =>
		expect(isValidTagName('    ')).toBe(false));

	it('returns true otherwise', () =>
		expect(isValidTagName('no-space')).toBe(true));
});

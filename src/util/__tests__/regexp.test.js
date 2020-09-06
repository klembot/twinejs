import {createRegExp, escapeRegExpReplace} from '../regexp';

describe('createRegExp', () => {
	it('creates a case-insensitive regexp by default', () => {
		const re = createRegExp('test', {});

		expect(re.test('TEST')).toBe(true);
	});

	it('escapes regexp characters by default', () => {
		const re = createRegExp('.', {});

		expect(re.test('a')).toBe(false);
	});

	it('creates a case-sensitive regexp if matchCase is true', () => {
		const re = createRegExp('test', {matchCase: true});

		expect(re.test('TEST')).toBe(false);
		expect(re.test('test')).toBe(true);
	});

	it('does not escape regexp characters if useRegexes is true', () => {
		const re = createRegExp('.', {useRegexes: true});

		expect(re.test('a')).toBe(true);
	});

	it('creates a case-sensitive regexp if both matchCase and useRegexes is true', () => {
		const re = createRegExp('T.ST', {matchCase: true, useRegexes: true});

		expect(re.test('TEST')).toBe(true);
		expect(re.test('test')).toBe(false);
	});
});

describe('escapeRegExpReplace', () => {
	it('escapes possible replace strings', () =>
		expect('test'.replace(/t(e)st/, escapeRegExpReplace('$1 $1'))).toBe(
			'$1 $1'
		));
});

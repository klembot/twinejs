const commaList = require('./comma-list');

describe('comma-list module', () => {
	test('checks for the presence of an entry with contains()', () => {
		expect(commaList.contains('foo,bar,baz', 'foo')).toBe(true);
		expect(commaList.contains('foo,bar,baz', 'bar')).toBe(true);
		expect(commaList.contains('foo,bar,baz', 'baz')).toBe(true);
	});
	
	test('adds an item with addUnique()', () => {
		expect(commaList.addUnique('foo', 'bar')).toBe('foo,bar');
		expect(commaList.addUnique('foo,bar', 'bar')).toBe('foo,bar');
		expect(commaList.addUnique('', 'bar')).toBe('bar');
		expect(commaList.addUnique('foo,baz', 'bar')).toBe('foo,baz,bar');
	});
	
	test('removes an item with remove()', () => {
		expect(commaList.remove('foo', 'foo')).toBe('');
		expect(commaList.remove('foo,bar', 'foo')).toBe('bar');
		expect(commaList.remove('foo,bar', 'bar')).toBe('foo');
		expect(commaList.remove('foo,bar,baz', 'bar')).toBe('foo,baz');
		expect(commaList.remove('foo,bar,baz', 'baz')).toBe('foo,bar');
	});
	
	test(
        'does not do anything if remove() is called with an entry not in the list',
        () => {
            expect(commaList.remove('foo,bar', 'baz')).toBe('foo,bar');
        }
    );
});

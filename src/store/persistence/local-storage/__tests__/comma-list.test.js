import {addUnique, contains, remove} from '../comma-list';

describe('comma-list', () => {
	test('checks for the presence of an entry with contains()', () => {
		expect(contains('foo,bar,baz', 'foo')).toBe(true);
		expect(contains('foo,bar,baz', 'bar')).toBe(true);
		expect(contains('foo,bar,baz', 'baz')).toBe(true);
	});

	test('adds an item with addUnique()', () => {
		expect(addUnique('foo', 'bar')).toBe('foo,bar');
		expect(addUnique('foo,bar', 'bar')).toBe('foo,bar');
		expect(addUnique('', 'bar')).toBe('bar');
		expect(addUnique('foo,baz', 'bar')).toBe('foo,baz,bar');
	});

	test('removes an item with remove()', () => {
		expect(remove('foo', 'foo')).toBe('');
		expect(remove('foo,bar', 'foo')).toBe('bar');
		expect(remove('foo,bar', 'bar')).toBe('foo');
		expect(remove('foo,bar,baz', 'bar')).toBe('foo,baz');
		expect(remove('foo,bar,baz', 'baz')).toBe('foo,bar');
	});

	test('does not do anything if remove() is called with an entry not in the list', () => {
		expect(remove('foo,bar', 'baz')).toBe('foo,bar');
	});
});

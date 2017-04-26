const { expect } = require('chai');
const commaList = require('./comma-list');

describe('comma-list module', () => {
	it('checks for the presence of an entry with contains()', () => {
		expect(commaList.contains('foo,bar,baz', 'foo')).to.be.true;
		expect(commaList.contains('foo,bar,baz', 'bar')).to.be.true;
		expect(commaList.contains('foo,bar,baz', 'baz')).to.be.true;
	});
	
	it('adds an item with addUnique()', () => {
		expect(commaList.addUnique('foo', 'bar')).to.equal('foo,bar');
		expect(commaList.addUnique('foo,bar', 'bar')).to.equal('foo,bar');
		expect(commaList.addUnique('', 'bar')).to.equal('bar');
		expect(commaList.addUnique('foo,baz', 'bar')).to.equal('foo,baz,bar');
	});
	
	it('removes an item with remove()', () => {
		expect(commaList.remove('foo', 'foo')).to.equal('');
		expect(commaList.remove('foo,bar', 'foo')).to.equal('bar');
		expect(commaList.remove('foo,bar', 'bar')).to.equal('foo');
		expect(commaList.remove('foo,bar,baz', 'bar')).to.equal('foo,baz');
		expect(commaList.remove('foo,bar,baz', 'baz')).to.equal('foo,bar');
	});
	
	it('does not do anything if remove() is called with an entry not in the list', () => {
		expect(commaList.remove('foo,bar', 'baz')).to.equal('foo,bar');
	});
});

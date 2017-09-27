const { expect } = require('chai');
const { spy } = require('sinon');
const actions = require('./pref');

describe('pref actions module', () => {
	let store;

	beforeEach(() => {
		store = { dispatch: spy() };
	});

	it('dispatches an UPDATE_PREF mutation with setPref()', () => {
		actions.setPref(store, 'key', 42);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('UPDATE_PREF', 'key', 42)).to.be.true;
	});
});
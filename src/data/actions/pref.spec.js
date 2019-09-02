import actions from './pref';

describe('pref actions module', () => {
	let store;

	beforeEach(() => {
		store = {dispatch: jest.fn()};
	});

	test('dispatches an UPDATE_PREF mutation with setPref()', () => {
		actions.setPref(store, 'key', 42);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith('UPDATE_PREF', 'key', 42);
	});
});

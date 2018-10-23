const pref = require('./pref');

describe('pref data module', () => {
	test('provides default settings', () => {
		expect(pref.state.appTheme).toBe('light');
		expect(pref.state.defaultFormat).toBe('Harlowe');
		expect(pref.state.donateShown).toBe(false);
		expect(typeof pref.state.firstRunTime).toBe('number');
		expect(pref.state.lastUpdateSeen).toBe('');
		expect(typeof pref.state.lastUpdateCheckTime).toBe('number');
		expect(typeof pref.state.locale).toBe('string');
		expect(pref.state.proofingFormat).toBe('Paperthin');
		expect(pref.state.welcomeSeen).toBe(false);
	});

	test('changes settings via a UPDATE_PREF mutation', () => {
		let state = {};

		pref.mutations.UPDATE_PREF(state, 'testing123', true);
		expect(state['testing123']).toBe(true);
	});
});

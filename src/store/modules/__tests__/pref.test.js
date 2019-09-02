import {state, mutations} from '../pref';

describe('Pref Vuex module', () => {
	it('provides default settings', () => {
		expect(state.appTheme).toBe('light');
		expect(state.defaultFormat).toBe('Harlowe');
		expect(state.donateShown).toBe(false);
		expect(typeof state.firstRunTime).toBe('number');
		expect(state.lastUpdateSeen).toBe('');
		expect(typeof state.lastUpdateCheckTime).toBe('number');
		expect(typeof state.locale).toBe('string');
		expect(state.proofingFormat).toBe('Paperthin');
		expect(state.welcomeSeen).toBe(false);
	});

	// TODO: derives default locale from browser settings

	it('changes settings via an update mutation', () => {
		let testState = {};

		mutations.update(testState, 'testing123', true);
		expect(testState['testing123']).toBe(true);
	});
});

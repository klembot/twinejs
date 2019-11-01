import {mutations} from '..';

describe('Pref Vuex module', () => {
	it('changes settings via an update mutation', () => {
		let testState = {};

		mutations.update(testState, {testing123: true});
		expect(testState['testing123']).toBe(true);
	});
});

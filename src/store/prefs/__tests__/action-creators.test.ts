import {setPref} from '../action-creators';

describe('setPref action', () => {
	it('returns an update action', () => {
		expect(setPref('locale', 'mock-locale')).toEqual({
			type: 'update',
			name: 'locale',
			value: 'mock-locale'
		});
	});
});

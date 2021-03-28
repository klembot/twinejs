import {setPref} from '../actions';

describe('setPref action', () => {
	let dispatch = jest.fn();

	it('sends an update action', () => {
		setPref(dispatch, 'locale', 'mock-locale');
		expect(dispatch).toHaveBeenCalledTimes(1);
		expect(dispatch.mock.calls[0]).toEqual([
			{
				type: 'update',
				name: 'locale',
				value: 'mock-locale'
			}
		]);
	});
});

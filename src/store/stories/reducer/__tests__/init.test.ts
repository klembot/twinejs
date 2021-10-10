import {initState} from '../init';
import {fakeStory} from '../../../../test-util';
import {StoriesState} from '../../stories.types';

describe('Story reducer initState action', () => {
	it('replaces state completely with a copy of the argument', () => {
		const oldState: StoriesState = [];
		const newState = [fakeStory()];

		const result = initState(oldState, newState);

		expect(result).not.toEqual(oldState);
		expect(result).not.toBe(newState);
		expect(result).toEqual(newState);
	});
});

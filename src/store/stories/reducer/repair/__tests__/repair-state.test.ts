import {repairState} from '../repair-state';
import {Story} from '../../../stories.types';
import {fakeStory, fakeUnloadedStoryFormat} from '../../../../../test-util';

jest.mock('../repair-story', () => ({
	repairStory: (story: Story) => ({story, mockRepaired: true})
}));

describe('repairState', () => {
	it('repairs all stories', () => {
		const state = [fakeStory(), fakeStory()];

		expect(
			repairState(state, [fakeUnloadedStoryFormat()], fakeUnloadedStoryFormat())
		).toEqual([
			{mockRepaired: true, story: state[0]},
			{mockRepaired: true, story: state[1]}
		]);
	});
});

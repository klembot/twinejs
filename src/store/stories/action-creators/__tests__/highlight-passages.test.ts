import {highlightPassagesMatchingSearch} from '../highlight-passages';
import {Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';
import {passagesMatchingSearch} from '../../getters';

jest.mock('../../getters');

describe('highlightPassagesMatchingSearch', () => {
	const matchMock = passagesMatchingSearch as jest.Mock;
	let dispatch: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		matchMock.mockReset();
		matchMock.mockImplementation(passages => [passages[0]]);
		story = fakeStory(3);
	});

	it('highlights passages based on the results of passagesMatchingSearch', () => {
		highlightPassagesMatchingSearch(story, 'a', {})(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassages',
					passageUpdates: {[story.passages[0].id]: {highlighted: true}},
					storyId: story.id
				}
			]
		]);
	});

	it('removes all highlights if given an empty search string', () => {
		story.passages[0].highlighted = true;
		story.passages[1].highlighted = true;
		story.passages[2].highlighted = true;

		highlightPassagesMatchingSearch(story, '', {})(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassages',
					passageUpdates: {
						[story.passages[0].id]: {highlighted: false},
						[story.passages[1].id]: {highlighted: false},
						[story.passages[2].id]: {highlighted: false}
					},
					storyId: story.id
				}
			]
		]);
	});
});

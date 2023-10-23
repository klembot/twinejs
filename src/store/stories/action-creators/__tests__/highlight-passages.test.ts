import {highlightPassages} from '../highlight-passages';
import {Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';

jest.mock('../../getters');

describe('highlightPassages', () => {
	let dispatch: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory(3);
	});

	it('dispatches only needed updates', () => {
		story.passages[0].highlighted = true;
		story.passages[1].highlighted = false;
		story.passages[2].highlighted = true;

		highlightPassages(story, [story.passages[1].id, story.passages[2].id])(
			dispatch,
			() => [story]
		);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassages',
					passageUpdates: {
						[story.passages[0].id]: {highlighted: false},
						[story.passages[1].id]: {highlighted: true}
					},
					storyId: story.id
				}
			]
		]);
	});
});

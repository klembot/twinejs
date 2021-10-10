import {setTagColor} from '../tag-color';
import {Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';

describe('setTagColor action creator', () => {
	let dispatch: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory();
	});

	it("returns a thunk that dispatches an updateStory action changing a story's tag colors", () => {
		setTagColor(story, 'mock-tag', 'red')(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					storyId: story.id,
					props: {tagColors: expect.objectContaining({'mock-tag': 'red'})}
				}
			]
		]);
	});

	it("returns a thunk that dispatches an updateStory action removing a tag color if it's set to 'none'", () => {
		story.tagColors['mock-tag'] = 'red';
		setTagColor(story, 'mock-tag', 'none')(dispatch, () => [story]);
		expect(
			dispatch.mock.calls[0][0].props.tagColors['mock-tag']
		).toBeUndefined();
	});

	it("returns a thunk that does nothing if the tag color is unset and the color is being set to 'none'", () => {
		delete story.tagColors['mock-tag'];
		setTagColor(story, 'mock-tag', 'none')(dispatch, () => [story]);
		expect(dispatch).not.toHaveBeenCalled();
	});

	it('returns a reducer that retains existing tag colors', () => {
		story.tagColors = {oneTag: 'red', anotherTag: 'blue'};
		setTagColor(story, 'mock-tag', 'green')(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					storyId: story.id,
					props: {
						tagColors: {oneTag: 'red', anotherTag: 'blue', 'mock-tag': 'green'}
					}
				}
			]
		]);
	});

	it('throws an error if a tag has an invalid name', () =>
		expect(() => setTagColor(story, 'a bad tag name', 'red')).toThrow());
});

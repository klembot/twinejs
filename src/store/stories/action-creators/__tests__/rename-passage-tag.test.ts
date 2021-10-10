import {renamePassageTag} from '../rename-passage-tag';
import {fakeStory} from '../../../../test-util';

describe('renamePassageTag', () => {
	let story = fakeStory(3);

	beforeEach(() => {
		story = fakeStory(3);
		story.passages[0].tags = ['a', 'b'];
		story.passages[1].tags = ['a', 'c'];
		story.passages[2].tags = ['c', 'd'];
	});

	it('returns a thunk renaming a tag in all passages', () => {
		const dispatch = jest.fn();

		renamePassageTag(story, 'a', 'z')(dispatch, () => [story]);
		expect(dispatch.mock.calls[0]).toEqual([
			{
				type: 'updatePassages',
				passageUpdates: {
					[story.passages[0].id]: {tags: ['z', 'b']},
					[story.passages[1].id]: {tags: ['z', 'c']}
				},
				storyId: story.id
			}
		]);
	});

	it('preserves the color set on the tag', () => {
		const dispatch = jest.fn();

		story.tagColors = {a: 'red'};
		renamePassageTag(story, 'a', 'z')(dispatch, () => [story]);
		expect(dispatch.mock.calls[1]).toEqual([
			{
				type: 'updateStory',
				props: {tagColors: {z: 'red'}},
				storyId: story.id
			}
		]);
	});

	it('renames tags case-sensitively', () => {
		const dispatch = jest.fn();

		renamePassageTag(story, 'A', 'z')(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([]);
	});

	it('returns a thunk that does nothing if the tag is not present', () => {
		const dispatch = jest.fn();

		renamePassageTag(story, 'z', 'a')(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([]);
	});

	it('throws an error if the tag name to rename to is invalid', () => {
		expect(() => renamePassageTag(story, 'a', '')).toThrow();
		expect(() => renamePassageTag(story, 'a', 'a space')).toThrow();
	});
});

import {renameStoryTag} from '../rename-story-tag';
import {fakeStory} from '../../../../test-util';

describe('renamePassageTag', () => {
	let stories = [fakeStory(), fakeStory(), fakeStory()];

	beforeEach(() => {
		stories[0].tags = ['a', 'b'];
		stories[1].tags = ['a', 'c'];
		stories[2].tags = ['c', 'd'];
	});

	it('returns a thunk renaming a tag in all stories', () => {
		const dispatch = jest.fn();

		renameStoryTag(stories, 'a', 'z')(dispatch, () => stories);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					props: {tags: ['z', 'b']},
					storyId: stories[0].id
				}
			],
			[
				{
					type: 'updateStory',
					props: {tags: ['z', 'c']},
					storyId: stories[1].id
				}
			]
		]);
	});

	it('renames tags case-sensitively', () => {
		const dispatch = jest.fn();

		renameStoryTag(stories, 'A', 'z')(dispatch, () => stories);
		expect(dispatch.mock.calls).toEqual([]);
	});

	it('returns a thunk that does nothing if the tag is not present', () => {
		const dispatch = jest.fn();

		renameStoryTag(stories, 'z', 'a')(dispatch, () => stories);
		expect(dispatch.mock.calls).toEqual([]);
	});

	it('throws an error if the tag name to rename to is invalid', () => {
		expect(() => renameStoryTag(stories, 'a', '')).toThrow();
		expect(() => renameStoryTag(stories, 'a', 'a space')).toThrow();
	});
});

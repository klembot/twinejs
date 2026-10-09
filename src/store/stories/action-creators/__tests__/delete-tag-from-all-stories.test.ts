import {deleteTagFromAllStories} from '../delete-tag-from-all-stories';
import {fakeStory, fakePassage} from '../../../../test-util';

describe('deleteTagFromAllStories', () => {
	const stories = [fakeStory(), fakeStory(), fakeStory()];

	beforeEach(() => {
		stories[0].tags = ['adventure', 'fantasy'];
		stories[0].tagColors = {'adventure': 'red', 'magic': 'blue'};
		stories[0].passages = [
			{...fakePassage(), tags: ['magic', 'combat']},
			{...fakePassage(), tags: ['adventure']}
		];
		
		stories[1].tags = ['adventure', 'scifi'];
		stories[1].tagColors = {'adventure': 'green', 'tech': 'yellow'};
		stories[1].passages = [
			{...fakePassage(), tags: ['tech']}
		];
		
		stories[2].tags = ['horror', 'mystery'];
		stories[2].tagColors = {'horror': 'purple'};
		stories[2].passages = [];
	});

	it('removes the tag from story.tags in all stories that have it', () => {
		const dispatch = jest.fn();

		deleteTagFromAllStories(stories, 'adventure')(dispatch, () => stories);
		
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					props: {tags: ['fantasy']},
					storyId: stories[0].id
				}
			],
			[
				{
					type: 'updateStory',
					props: {tags: ['scifi']},
					storyId: stories[1].id
				}
			]
		]);
	});

	it('does not remove tag colors from story.tagColors', () => {
		const dispatch = jest.fn();

		deleteTagFromAllStories(stories, 'adventure')(dispatch, () => stories);
		
		// Verify no actions were dispatched to remove tagColors
		const hasTagColorUpdate = dispatch.mock.calls.some(call => 
			call[0].props && call[0].props.tagColors
		);
		expect(hasTagColorUpdate).toBe(false);
	});

	it('does not affect passage tags', () => {
		const dispatch = jest.fn();

		deleteTagFromAllStories(stories, 'magic')(dispatch, () => stories);
		
		// No dispatch calls should be made since 'magic' is only in passages, not story tags
		expect(dispatch.mock.calls).toEqual([]);
	});

	it('deletes tags case-sensitively', () => {
		const dispatch = jest.fn();

		deleteTagFromAllStories(stories, 'Adventure')(dispatch, () => stories);
		
		expect(dispatch.mock.calls).toEqual([]);
	});

	it('does nothing if the tag is not present in any story', () => {
		const dispatch = jest.fn();

		deleteTagFromAllStories(stories, 'nonexistent')(dispatch, () => stories);
		
		expect(dispatch.mock.calls).toEqual([]);
	});

	it('only affects stories that have the tag', () => {
		const dispatch = jest.fn();

		deleteTagFromAllStories(stories, 'horror')(dispatch, () => stories);
		
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					props: {tags: ['mystery']},
					storyId: stories[2].id
				}
			]
		]);
	});
});

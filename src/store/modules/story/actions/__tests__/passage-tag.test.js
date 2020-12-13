import {addPassageTag, removePassageTag} from '../passage-tag';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('addPassageTag action', () => {
	const story = fakeStoryObject(1);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	beforeEach(() => (story.passages[0].tags = ['mock-tag']));

	it('commits an updatePassage mutation to add the tag', () =>
		expect(
			actionCommits(
				addPassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 'mock-tag-2'
				},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					storyId: story.id,
					passageProps: {tags: ['mock-tag', 'mock-tag-2']}
				}
			]
		]));

	it('handles a passage with no tags property properly', () => {
		delete story.passages[0].tags;
		expect(
			actionCommits(
				addPassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 'mock-tag-2'
				},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					storyId: story.id,
					passageProps: {tags: ['mock-tag-2']}
				}
			]
		]);
	});

	it('handles a passage with a non-array tags property properly', () => {
		story.passages[0].tags = 'wrong';
		expect(
			actionCommits(
				addPassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 'mock-tag-2'
				},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					storyId: story.id,
					passageProps: {tags: ['mock-tag-2']}
				}
			]
		]);
	});

	it('does nothing if the passage already has the tag', () =>
		expect(
			actionCommits(
				addPassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 'mock-tag'
				},
				getters
			)
		).toEqual([]));

	it('throws an error if the tag is not a string', () =>
		expect(() =>
			actionCommits(
				addPassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 1
				},
				getters
			)
		).toThrow());

	it('throws an error if the tag has a space in its name', () =>
		expect(() =>
			actionCommits(
				addPassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 'bad tag name'
				},
				getters
			)
		).toThrow());

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				addPassageTag,
				{
					storyId: story.id + 'nonexistent',
					passageId: story.passages[0].id,
					tagName: 'mock-tag-2'
				},
				getters
			)
		).toThrow());

	it('throws an error if there is no passage with the given ID belonging to the story', () =>
		expect(() =>
			actionCommits(
				addPassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id + 'nonexistent',
					tagName: 'mock-tag-2'
				},
				getters
			)
		).toThrow());
});

describe('removePassageTag action', () => {
	const story = fakeStoryObject(1);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	beforeEach(() => (story.passages[0].tags = ['mock-tag']));

	it('commits an updatePassage mutation to remove the tag', () =>
		expect(
			actionCommits(
				removePassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 'mock-tag'
				},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					storyId: story.id,
					passageProps: {tags: []}
				}
			]
		]));

	it('does nothing if the tag does not exist on the passage', () =>
		expect(
			actionCommits(
				removePassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 'mock-tag-2'
				},
				getters
			)
		).toEqual([]));

	it('does nothing if the passage has a non-array tags property', () => {
		delete story.passages[0].tags;

		expect(
			actionCommits(
				removePassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 'mock-tag'
				},
				getters
			)
		).toEqual([]);

		story.passages[0].tags = 'wrong';

		expect(
			actionCommits(
				removePassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id,
					tagName: 'mock-tag'
				},
				getters
			)
		).toEqual([]);
	});

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				removePassageTag,
				{
					storyId: story.id + 'nonexistent',
					passageId: story.passages[0].id,
					tagName: 'mock-tag'
				},
				getters
			)
		).toThrow());

	it('throws an error if there is no passage with the given ID belonging to the story', () =>
		expect(() =>
			actionCommits(
				addPassageTag,
				{
					storyId: story.id,
					passageId: story.passages[0].id + 'nonexistent',
					tagName: 'mock-tag'
				},
				getters
			)
		).toThrow());
});

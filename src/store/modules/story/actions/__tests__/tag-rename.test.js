import {renameTag} from '../tag-rename';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('renameTag action', () => {
	const story = fakeStoryObject(2);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	beforeEach(() => {
		story.passages[0].tags = ['tag-1', 'tag-2'];
		story.passages[1].tags = ['tag-1', 'tag-3'];
	});

	it('renames all instances of a tag name', () =>
		expect(
			actionCommits(
				renameTag,
				{
					newTagName: 'renamed',
					oldTagName: 'tag-1',
					storyId: story.id
				},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					passageProps: {tags: ['renamed', 'tag-2']},
					storyId: story.id
				}
			],
			[
				'updatePassage',
				{
					passageId: story.passages[1].id,
					passageProps: {tags: ['renamed', 'tag-3']},
					storyId: story.id
				}
			]
		]));

	it('is case-sensitive', () =>
		expect(
			actionCommits(
				renameTag,
				{
					newTagName: 'renamed',
					oldTagName: 'TAG-1',
					storyId: story.id
				},
				getters
			)
		).toEqual([]));

	it('throws an error if a tag has a space in its name', () => {
		expect(() =>
			actionCommits(
				renameTag,
				{
					newTagName: 'bad name',
					oldTagName: 'tag-1',
					storyId: story.id
				},
				getters
			)
		).toThrow();

		expect(() =>
			actionCommits(
				renameTag,
				{
					newTagName: 'tag-1',
					oldTagName: 'bad name',
					storyId: story.id
				},
				getters
			)
		).toThrow();
	});

	it('throws an error if a tag is not a string', () => {
		expect(() =>
			actionCommits(
				renameTag,
				{
					newTagName: 0,
					oldTagName: 'tag-1',
					storyId: story.id
				},
				getters
			)
		).toThrow();

		expect(() =>
			actionCommits(
				renameTag,
				{
					newTagName: 'tag-1',
					oldTagName: 0,
					storyId: story.id
				},
				getters
			)
		).toThrow();
	});

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				renameTag,
				{
					newTagName: 'renamed',
					oldTagName: 'tag-1',
					storyId: story.id + 'non-existent'
				},
				getters
			)
		).toThrow());
});

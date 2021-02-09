import {deletePassages} from '../passage-delete';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('deletePassages action', () => {
	const story = fakeStoryObject(2);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	it('commits a deletePassage mutation when story and passage exist', () => {
		expect(
			actionCommits(
				deletePassages,
				{passageIds: [story.passages[0].id], storyId: story.id},
				getters
			)
		).toEqual([
			['deletePassage', {passageId: story.passages[0].id, storyId: story.id}]
		]);

		expect(
			actionCommits(
				deletePassages,
				{
					passageIds: [story.passages[0].id, story.passages[1].id],
					storyId: story.id
				},
				getters
			)
		).toEqual([
			['deletePassage', {passageId: story.passages[0].id, storyId: story.id}],
			['deletePassage', {passageId: story.passages[1].id, storyId: story.id}]
		]);
	});

	it('throws an error if there is no story with the given ID in state', () => {
		expect(() =>
			actionCommits(
				deletePassages,
				{
					passageIds: [story.passages[0].id],
					storyId: story.id + 'nonexistent'
				},
				getters
			)
		).toThrow();
	});

	it('throws an error if there is no passage with the given ID belonging to the story', () => {
		expect(() =>
			actionCommits(
				deletePassages,
				{passageIds: [story.passages[0].id + 'nonexistent'], storyId: story.id},
				getters
			)
		).toThrow();
	});
});

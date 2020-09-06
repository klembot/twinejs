import {deletePassage} from '../passage-delete';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('deletePassage action', () => {
	const story = fakeStoryObject(1);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	it('commits a deletePassage mutation when story and passage exist', () => {
		const payload = {passageId: story.passages[0].id, storyId: story.id};

		expect(actionCommits(deletePassage, payload, getters)).toEqual([
			['deletePassage', payload]
		]);
	});

	it('throws an error if there is no story with the given ID in state', () => {
		expect(() =>
			actionCommits(
				deletePassage,
				{
					passageId: story.passages[0].id,
					storyId: story.id + 'nonexistent'
				},
				getters
			)
		).toThrow();
	});

	it('throws an error if there is no passage with the given ID belonging to the story', () => {
		expect(() =>
			actionCommits(
				deletePassage,
				{passageId: story.passages[0].id + 'nonexistent', storyId: story.id},
				getters
			)
		).toThrow();
	});
});

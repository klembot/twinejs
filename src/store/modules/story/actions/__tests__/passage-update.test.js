import {updatePassage} from '../passage-update';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('updatePassage action', () => {
	const story = fakeStoryObject(1);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	it('commits an updatePassage mutation when story and passage exist', () => {
		const payload = {
			passageId: story.passages[0].id,
			storyId: story.id,
			passageProps: {name: 'test'}
		};

		expect(actionCommits(updatePassage, payload, getters)).toEqual([
			['updatePassage', payload]
		]);
	});

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				updatePassage,
				{
					passageId: story.passages[0].id,
					passageProps: {name: 'test'},
					storyId: story.id + 'nonexistent'
				},
				getters
			)
		).toThrow());

	it('throws an error if there is no passage with the given ID belonging to the story', () =>
		expect(() =>
			actionCommits(
				updatePassage,
				{
					passageId: story.passages[0].id + 'nonexistent',
					passageProps: {name: 'test'},
					storyId: story.id
				},
				getters
			)
		).toThrow());
});

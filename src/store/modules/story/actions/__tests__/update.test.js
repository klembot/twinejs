import {updateStory} from '../update';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('updateStory action', () => {
	const story = fakeStoryObject(0);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	it('commits a updateStory mutation with supplied storyProps if the story exists', () => {
		const payload = {storyId: story.id, storyProps: {name: 'test'}};

		expect(actionCommits(updateStory, payload, getters)).toEqual([
			['updateStory', payload]
		]);
	});

	it("throws an error if the story ID doesn't match a story in state", () =>
		expect(() =>
			actionCommits(
				updateStory,
				{
					storyId: story.id + 'nonexistent',
					storyProps: {name: 'test'}
				},
				getters
			)
		).toThrow());
});

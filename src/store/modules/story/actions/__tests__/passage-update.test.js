import {updatePassage, updatePassageSize} from '../passage-update';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('updatePassage action', () => {
	const story = fakeStoryObject(2);
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

	it('throws an error if there is already a passage with the name being updated to', () =>
		expect(() =>
			actionCommits(
				updatePassage,
				{
					passageId: story.passages[0].id,
					passageProps: {name: story.passages[1].name},
					storyId: story.id
				},
				getters
			)
		).toThrow());

	it("doesn't throw an error if the update is setting the name to what it already is", () =>
		expect(() =>
			actionCommits(
				updatePassage,
				{
					passageId: story.passages[0].id,
					passageProps: {name: story.passages[0].name},
					storyId: story.id
				},
				getters
			)
		).not.toThrow());
});

describe('updatePassageSize action', () => {
	const story = fakeStoryObject(2);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	it('commits an updatePassage mutation when story and passage exist', () =>
		expect(
			actionCommits(
				updatePassageSize,
				{
					passageId: story.passages[0].id,
					storyId: story.id,
					passageSizeDescription: 'wide'
				},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					storyId: story.id,
					passageProps: {height: 100, width: 200}
				}
			]
		]));

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				updatePassageSize,
				{
					passageId: story.passages[0].id,
					passageSizeDescription: 'wide',
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
					passageSizeDescription: 'wide',
					storyId: story.id
				},
				getters
			)
		).toThrow());
});

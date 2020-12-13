import {setTagColor} from '../tag-color';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('setTagColor action', () => {
	const story = fakeStoryObject(0);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	beforeEach(() => (story.tagColors = {}));

	it('commits an updateStory mutation to set the tag color', () =>
		expect(
			actionCommits(
				setTagColor,
				{
					storyId: story.id,
					tagName: 'mock-tag',
					tagColor: 'red'
				},
				getters
			)
		).toEqual([
			[
				'updateStory',
				{storyId: story.id, storyProps: {tagColors: {'mock-tag': 'red'}}}
			]
		]));

	it('retains existing tag colors', () => {
		story.tagColors = {'pre-existing': 'blue'};
		expect(
			actionCommits(
				setTagColor,
				{
					storyId: story.id,
					tagName: 'mock-tag',
					tagColor: 'red'
				},
				getters
			)
		).toEqual([
			[
				'updateStory',
				{
					storyId: story.id,
					storyProps: {tagColors: {'mock-tag': 'red', 'pre-existing': 'blue'}}
				}
			]
		]);
	});

	it('handles a story with no tagColors property properly', () => {
		delete story.tagColors;
		expect(
			actionCommits(
				setTagColor,
				{
					storyId: story.id,
					tagName: 'mock-tag',
					tagColor: 'red'
				},
				getters
			)
		).toEqual([
			[
				'updateStory',
				{
					storyId: story.id,
					storyProps: {tagColors: {'mock-tag': 'red'}}
				}
			]
		]);
	});

	it('handles a story with a non-object tagColors property properly', () => {
		story.tagColors = 'wrong';
		expect(
			actionCommits(
				setTagColor,
				{
					storyId: story.id,
					tagName: 'mock-tag',
					tagColor: 'red'
				},
				getters
			)
		).toEqual([
			[
				'updateStory',
				{
					storyId: story.id,
					storyProps: {tagColors: {'mock-tag': 'red'}}
				}
			]
		]);
	});

	it('throws an error if the tag has a space in its name', () =>
		expect(() =>
			actionCommits(setTagColor, {
				storyId: story.id,
				tagName: 'bad name',
				tagColor: 'red'
			})
		).toThrow());

	it('throws an error if the tag is not a string', () =>
		expect(() =>
			actionCommits(setTagColor, {
				storyId: story.id,
				tagName: 1,
				tagColor: 'red'
			})
		).toThrow());

	it('throws an error if a bad color name is passed', () =>
		expect(() =>
			actionCommits(setTagColor, {
				storyId: story.id,
				tagName: 'mock-tag',
				tagColor: 'indigo'
			})
		).toThrow());

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(setTagColor, {
				storyId: story.id + 'non-existent',
				tagName: 'mock-tag',
				tagColor: 'red'
			})
		).toThrow());
});

import {changeZoom} from '../zoom';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('changeZoom action', () => {
	const story = fakeStoryObject(0);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	beforeEach(() => {
		story.zoom = 1.0;
	});

	it('commits a updateStory mutation with the changed zoom', () => {
		expect(
			actionCommits(changeZoom, {storyId: story.id, change: 0.5}, getters)
		).toEqual([
			[
				'updateStory',
				{
					storyId: story.id,
					storyProps: {zoom: 1.5}
				}
			]
		]);
	});

	it('clamps zoom values below 10% to 10%', () => {
		expect(
			actionCommits(changeZoom, {storyId: story.id, change: -100}, getters)
		).toEqual([
			[
				'updateStory',
				{
					storyId: story.id,
					storyProps: {zoom: 0.1}
				}
			]
		]);
	});

	it('clamps zoom values above 200% to 200%', () => {
		expect(
			actionCommits(changeZoom, {storyId: story.id, change: 100}, getters)
		).toEqual([
			[
				'updateStory',
				{
					storyId: story.id,
					storyProps: {zoom: 2}
				}
			]
		]);
	});

	it('throws an error if the zoom property is not numeric', () =>
		expect(() =>
			actionCommits(changeZoom, {storyId: story.id, change: 'a'}, getters)
		).toThrow());

	it("throws an error if the story ID doesn't match a story in state", () =>
		expect(() =>
			actionCommits(
				changeZoom,
				{storyId: story.id + 'nonexistent', change: 0},
				getters
			)
		).toThrow());
});

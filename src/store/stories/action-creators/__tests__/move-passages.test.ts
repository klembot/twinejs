import {movePassages} from '../move-passages';
import {Passage, Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';

describe('movePassages action creator', () => {
	let passage0: Passage;
	let passage2: Passage;
	let story: Story;

	beforeEach(() => {
		story = fakeStory(3);
		passage0 = story.passages[0];
		passage2 = story.passages[2];
	});

	it('returns an updatePassages action that moves passages with the provided IDs by an offset', () =>
		expect(movePassages(story, [passage0.id, passage2.id], 10, 10)).toEqual({
			type: 'updatePassages',
			passageUpdates: {
				[passage0.id]: {left: passage0.left + 10, top: passage0.top + 10},
				[passage2.id]: {left: passage2.left + 10, top: passage2.top + 10}
			},
			storyId: story.id
		}));

	it('forces all moved passages to have positive top and left positions', () => {
		passage0.left = 0;
		passage0.top = 0;
		passage2.left = 100;
		passage2.top = 100;

		expect(movePassages(story, [passage0.id, passage2.id], -100, -100)).toEqual(
			{
				type: 'updatePassages',
				passageUpdates: {
					[passage0.id]: {left: 0, top: 0},
					[passage2.id]: {left: 0, top: 0}
				},
				storyId: story.id
			}
		);
	});

	it("snaps passages to a 25px grid if the story's snapToGrid property is true", () => {
		passage0.left = 10;
		passage0.top = 10;
		passage2.left = 20;
		passage2.top = 20;
		story.snapToGrid = true;

		expect(movePassages(story, [passage0.id, passage2.id], 5, 5)).toEqual({
			type: 'updatePassages',
			passageUpdates: {
				[passage0.id]: {left: 25, top: 25},
				[passage2.id]: {left: 25, top: 25}
			},
			storyId: story.id
		});
	});

	it("doesn't snap passages to a grid if the story's snapToGrid property is false", () => {
		passage0.left = 10;
		passage0.top = 10;
		passage2.left = 20;
		passage2.top = 20;
		story.snapToGrid = false;

		expect(movePassages(story, [passage0.id, passage2.id], 5, 5)).toEqual({
			type: 'updatePassages',
			passageUpdates: {
				[passage0.id]: {left: 15, top: 15},
				[passage2.id]: {left: 25, top: 25}
			},
			storyId: story.id
		});
	});

	it('throws an error if either offset is not a finite number', () => {
		expect(() =>
			movePassages(story, [passage0.id, passage2.id], NaN, 0)
		).toThrow();
		expect(() =>
			movePassages(story, [passage0.id, passage2.id], 0, NaN)
		).toThrow();
		expect(() =>
			movePassages(story, [passage0.id, passage2.id], NaN, NaN)
		).toThrow();
		expect(() =>
			movePassages(story, [passage0.id, passage2.id], Infinity, 0)
		).toThrow();
		expect(() =>
			movePassages(story, [passage0.id, passage2.id], 0, Infinity)
		).toThrow();
		expect(() =>
			movePassages(story, [passage0.id, passage2.id], Infinity, Infinity)
		).toThrow();
	});

	it('throws an error if any passage ID provided does not belong to the story', () =>
		expect(() => movePassages(story, ['bad-id'], 0, 0)).toThrow());
});

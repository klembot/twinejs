import {Thunk} from 'react-hook-thunk-reducer';
import {reverseAction} from '../reverse-action';
import {fakeStory} from '../../../test-util';
import {StoriesAction, StoriesState} from '../../stories';

describe('reverseAction', () => {
	const story = fakeStory(3);

	describe('when passed a createPassage action', () => {
		it('returns a deletePassage action if the passage supplies an ID', () =>
			expect(
				reverseAction(
					{
						type: 'createPassage',
						props: {id: story.passages[0].id},
						storyId: story.id
					},
					[story]
				)
			).toEqual({
				type: 'deletePassage',
				passageId: story.passages[0].id,
				storyId: story.id
			}));

		it('returns a thunk to delete a passage created through a createPassage action that supplies a name', () => {
			const dispatch = jest.fn();
			const thunk = reverseAction(
				{
					type: 'createPassage',
					props: {name: story.passages[0].name},
					storyId: story.id
				},
				[story]
			) as Thunk<StoriesState, StoriesAction>;

			thunk(dispatch, () => [story]);
			expect(dispatch.mock.calls).toEqual([
				[
					{
						type: 'deletePassage',
						passageId: story.passages[0].id,
						storyId: story.id
					}
				]
			]);
		});

		it('throws an error if neither a name or ID is in the action', () =>
			expect(() =>
				reverseAction(
					{type: 'createPassage', props: {text: 'test'}, storyId: story.id},
					[story]
				)
			).toThrow());
	});

	describe('when passed a deletePassage action', () => {
		it('returns a createPassage action with all previous properties', () =>
			expect(
				reverseAction(
					{
						type: 'deletePassage',
						passageId: story.passages[0].id,
						storyId: story.id
					},
					[story]
				)
			).toEqual({
				type: 'createPassage',
				props: story.passages[0],
				storyId: story.id
			}));
	});

	describe('when passed a deletePassages action', () => {
		it('returns a createPassages action with all previous properties', () =>
			expect(
				reverseAction(
					{
						type: 'deletePassages',
						passageIds: [story.passages[0].id, story.passages[1].id],
						storyId: story.id
					},
					[story]
				)
			).toEqual({
				type: 'createPassages',
				props: [story.passages[0], story.passages[1]],
				storyId: story.id
			}));
	});

	describe('when passed an updatePassage action', () => {
		it('returns an updatePassage action reversing the change, for only the properties being updated', () => {
			const oldLeft = story.passages[0].left;
			const oldName = story.passages[0].name;

			expect(
				reverseAction(
					{
						type: 'updatePassage',
						passageId: story.passages[0].id,
						props: {left: story.passages[0].left + 100, name: 'new-name'},
						storyId: story.id
					},
					[story]
				)
			).toEqual({
				type: 'updatePassage',
				passageId: story.passages[0].id,
				props: {
					left: oldLeft,
					name: oldName
				},
				storyId: story.id
			});
		});
	});

	describe('when passed an updatePassages action', () => {
		it('returns an updatePassages action reversing the change, for only the properties being updated', () => {
			const oldP1Left = story.passages[0].left;
			const oldP1Name = story.passages[0].name;
			const oldP2Width = story.passages[1].width;

			expect(
				reverseAction(
					{
						type: 'updatePassages',
						passageUpdates: {
							[story.passages[0].id]: {
								left: story.passages[0].left + 100,
								name: 'new-name'
							},
							[story.passages[1].id]: {
								width: story.passages[1].width + 100
							}
						},
						storyId: story.id
					},
					[story]
				)
			).toEqual({
				type: 'updatePassages',
				passageUpdates: {
					[story.passages[0].id]: {
						left: oldP1Left,
						name: oldP1Name
					},
					[story.passages[1].id]: {
						width: oldP2Width
					}
				},
				storyId: story.id
			});
		});
	});

	describe('when passed an updateStory action', () => {
		it('returns an updateStory action reversing the change, for only the properties being updated', () => {
			const oldZoom = story.zoom;
			const oldName = story.name;

			expect(
				reverseAction(
					{
						type: 'updateStory',
						props: {name: 'new-name', zoom: story.zoom + 1},
						storyId: story.id
					},
					[story]
				)
			).toEqual({
				type: 'updateStory',
				props: {
					name: oldName,
					zoom: oldZoom
				},
				storyId: story.id
			});
		});
	});

	describe("when passed an action it doesn't know how to reverse", () => {
		it('throws an error', () =>
			expect(() =>
				reverseAction({type: 'init', state: []}, [story])
			).toThrow());
	});
});

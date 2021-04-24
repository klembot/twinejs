import {Thunk} from 'react-hook-thunk-reducer';
import {reverseAction} from '../reverse-action';
import {fakePassage, fakeStory} from '../../../test-util/fakes';
import {StoriesAction, StoriesState} from '../../stories';
import {reducer} from '../../stories/reducer';

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

	describe("when passed an action it doesn't know how to reverse", () => {
		it('throws an error', () =>
			expect(() =>
				reverseAction({type: 'init', state: []}, [story])
			).toThrow());
	});
});

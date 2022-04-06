import {CreatePassageAction} from '../../stories';
import {reducer} from '../reducer';
import {fakeStory, fakeUndoableStoryChange} from '../../../test-util';

jest.mock('../reverse-action');

describe('Undoable stories reducer', () => {
	const mockAction: CreatePassageAction = {
		type: 'createPassage',
		props: {name: 'mock-passage-name'},
		storyId: 'mock-story-id'
	};

	describe('when it receives an addChange action', () => {
		const mockStories = [fakeStory(), fakeStory()];

		it('adds the change to the end of the list', () => {
			expect(
				reducer(
					{changes: [], currentChange: -1},
					{
						type: 'addChange',
						action: mockAction,
						description: 'mock-desc',
						storiesState: mockStories
					}
				)
			).toEqual(
				expect.objectContaining({
					changes: [
						{
							description: 'mock-desc',
							redo: mockAction,
							undo: {
								action: mockAction,
								mockReversed: true,
								state: mockStories
							}
						}
					]
				})
			);
		});

		it('does not affect existing changes at currentChange or below', () => {
			const mockChanges = [
				fakeUndoableStoryChange(),
				fakeUndoableStoryChange()
			];

			expect(
				reducer(
					{changes: mockChanges, currentChange: 1},
					{
						type: 'addChange',
						action: mockAction,
						description: 'mock-desc',
						storiesState: mockStories
					}
				)
			).toEqual(
				expect.objectContaining({
					changes: [
						mockChanges[0],
						mockChanges[1],
						{
							description: 'mock-desc',
							redo: mockAction,
							undo: {
								action: mockAction,
								mockReversed: true,
								state: mockStories
							}
						}
					]
				})
			);
		});

		it('removes changes above currentChange', () => {
			const mockChanges = [
				fakeUndoableStoryChange(),
				fakeUndoableStoryChange()
			];

			expect(
				reducer(
					{changes: mockChanges, currentChange: 0},
					{
						type: 'addChange',
						action: mockAction,
						description: 'mock-desc',
						storiesState: mockStories
					}
				)
			).toEqual(
				expect.objectContaining({
					changes: [
						mockChanges[0],
						{
							description: 'mock-desc',
							redo: mockAction,
							undo: {
								action: mockAction,
								mockReversed: true,
								state: mockStories
							}
						}
					]
				})
			);
		});

		it('sets currentChange to the end of the change array', () => {
			expect(
				reducer(
					{changes: [], currentChange: -1},
					{
						type: 'addChange',
						action: mockAction,
						description: 'mock-desc',
						storiesState: mockStories
					}
				)
			).toEqual(expect.objectContaining({currentChange: 0}));

			expect(
				reducer(
					{changes: [fakeUndoableStoryChange()], currentChange: 0},
					{
						type: 'addChange',
						action: mockAction,
						description: 'mock-desc',
						storiesState: mockStories
					}
				)
			).toEqual(expect.objectContaining({currentChange: 1}));

			expect(
				reducer(
					{
						changes: [fakeUndoableStoryChange(), fakeUndoableStoryChange()],
						currentChange: 1
					},
					{
						type: 'addChange',
						action: mockAction,
						description: 'mock-desc',
						storiesState: mockStories
					}
				)
			).toEqual(expect.objectContaining({currentChange: 2}));

			expect(
				reducer(
					{
						changes: [fakeUndoableStoryChange(), fakeUndoableStoryChange()],
						currentChange: 0
					},
					{
						type: 'addChange',
						action: mockAction,
						description: 'mock-desc',
						storiesState: mockStories
					}
				)
			).toEqual(expect.objectContaining({currentChange: 1}));
		});
	});

	describe('when it receives an updateCurrent action', () => {
		it('changes currentChange in state', () => {
			expect(
				reducer(
					{
						changes: [fakeUndoableStoryChange(), fakeUndoableStoryChange()],
						currentChange: 0
					},
					{
						type: 'updateCurrent',
						change: 1
					}
				)
			).toEqual(expect.objectContaining({currentChange: 1}));
			expect(
				reducer(
					{
						changes: [fakeUndoableStoryChange(), fakeUndoableStoryChange()],
						currentChange: 1
					},
					{
						type: 'updateCurrent',
						change: -1
					}
				)
			).toEqual(expect.objectContaining({currentChange: 0}));
		});

		it('does not allow currentChange to become less than -1', () => {
			expect(
				reducer(
					{
						changes: [fakeUndoableStoryChange(), fakeUndoableStoryChange()],
						currentChange: 0
					},
					{
						type: 'updateCurrent',
						change: -1
					}
				)
			).toEqual(expect.objectContaining({currentChange: -1}));

			expect(
				reducer(
					{
						changes: [fakeUndoableStoryChange(), fakeUndoableStoryChange()],
						currentChange: -1
					},
					{
						type: 'updateCurrent',
						change: -1
					}
				)
			).toEqual(expect.objectContaining({currentChange: -1}));
		});

		it('does not allow currentChange to become greater than the length of changes', () => {
			expect(
				reducer(
					{
						changes: [fakeUndoableStoryChange(), fakeUndoableStoryChange()],
						currentChange: 1
					},
					{
						type: 'updateCurrent',
						change: 1
					}
				)
			).toEqual(expect.objectContaining({currentChange: 1}));
		});
	});
});

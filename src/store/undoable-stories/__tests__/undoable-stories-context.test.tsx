import * as React from 'react';
import {act, renderHook} from '@testing-library/react-hooks';
import {
	UndoableStoriesContextProvider,
	useUndoableStoriesContext
} from '../undoable-stories-context';
import {reducer} from '../reducer';
import {
	StoriesAction,
	StoriesContext,
	StoriesContextProps
} from '../../stories';
import {fakeStory} from '../../../test-util';

jest.mock('../reducer');
jest.mock('../reverse-action');

interface WrapperProps {
	dispatch?: jest.Mock;
	storiesContext: Partial<StoriesContextProps>;
}

const wrapper: React.FC<WrapperProps> = ({
	children,
	dispatch = jest.fn(),
	storiesContext
}) => (
	<StoriesContext.Provider
		value={{
			dispatch,
			stories: [],
			...storiesContext
		}}
	>
		<UndoableStoriesContextProvider>{children}</UndoableStoriesContextProvider>
	</StoriesContext.Provider>
);

describe('<UndoableStoriesContextProvider>', () => {
	const reducerMock = reducer as jest.Mock;

	it('passes through stories from its parent StoriesContext', () => {
		const stories = [fakeStory()];
		const {result} = renderHook(() => useUndoableStoriesContext(), {
			initialProps: {storiesContext: {stories}},
			wrapper
		});

		expect(result.current.stories).toBe(stories);
	});

	describe('its dispatch function', () => {
		it('sends the action to the parent StoriesContext', () => {
			const dispatch = jest.fn();
			const stories = [fakeStory()];
			const {result} = renderHook(() => useUndoableStoriesContext(), {
				initialProps: {storiesContext: {dispatch, stories}},
				wrapper
			});

			expect(result.current.stories).toBe(stories);
			act(() => result.current.dispatch({type: 'init', state: []}));
			expect(dispatch).toBeCalledTimes(1);
		});

		it('sends an addChange action to the undoableStories reducer if a description is passed', () => {
			const dispatch = jest.fn();
			const stories = [fakeStory()];
			const mockAction: StoriesAction = {type: 'init', state: []};
			const {result} = renderHook(() => useUndoableStoriesContext(), {
				initialProps: {storiesContext: {dispatch, stories}},
				wrapper
			});

			act(() => result.current.dispatch(mockAction, 'mock-description'));
			expect(reducerMock.mock.calls).toEqual([
				[
					{changes: [], currentChange: -1},
					{
						type: 'addChange',
						action: mockAction,
						description: 'mock-description',
						storiesState: stories
					}
				]
			]);
		});

		it('does not send an addChange action if no description is passed', () => {
			const dispatch = jest.fn();
			const stories = [fakeStory()];
			const mockAction: StoriesAction = {type: 'init', state: []};
			const {result} = renderHook(() => useUndoableStoriesContext(), {
				initialProps: {storiesContext: {dispatch, stories}},
				wrapper
			});

			act(() => result.current.dispatch(mockAction));
			expect(reducerMock.mock.calls).toEqual([]);
		});
	});

	describe('its redo function', () => {
		it.todo('exists if there is a change later than the current one');
		it.todo(
			'dispatches the redo action of the change later than the current one to the stories context'
		);
		it.todo('increases the current change by 1');
		it.todo("doesn't exist if there isn't a change later than the current one");
	});

	describe('its redoLabel property', () => {
		it.todo('reflects the proper change description');
		it.todo("doesn't exist if there isn't a change later than the current one");
	});

	fdescribe('its undo function', () => {
		const dispatch = jest.fn();
		const stories = [fakeStory()];
		const redo = {type: 'init', state: {}};
		const undo = {type: 'init', state: {}};

		beforeEach(() => {
			reducerMock.mockImplementation(() => ({
				currentChange: 0,
				changes: [{redo, undo, description: 'mock-change-description'}]
			}));
		});

		it('exists if there is a current change', () => {
			const {result} = renderHook(() => useUndoableStoriesContext(), {
				initialProps: {storiesContext: {dispatch, stories}},
				wrapper
			});

			// This change doesn't matter-- the mock reducer supplies the state.

			act(() =>
				result.current.dispatch({type: 'init', state: []}, 'mock-description')
			);
			expect(result.current.undo).not.toBeUndefined();
		});

		it('dispatches the undo action of the current change', () => {
			const {result} = renderHook(() => useUndoableStoriesContext(), {
				initialProps: {storiesContext: {dispatch, stories}},
				wrapper
			});

			// This change doesn't matter-- the mock reducer supplies the state.

			act(() =>
				result.current.dispatch({type: 'init', state: []}, 'mock-description')
			);
			dispatch.mockReset();
			act(() => result.current.undo!());
			expect(dispatch.mock.calls).toEqual([[undo]]);
		});

		// This needs some help-- running the undo in the mocks causes an error.

		it.todo('dispatches an updateCurrent action to the undo reducer');

		it("doesn't exist if there isn't a current change", () => {
			reducerMock.mockImplementation(() => ({
				currentChange: -1,
				changes: []
			}));

			const {result} = renderHook(() => useUndoableStoriesContext(), {
				initialProps: {storiesContext: {dispatch, stories}},
				wrapper
			});

			// This change doesn't matter-- the mock reducer supplies the state.

			act(() =>
				result.current.dispatch({type: 'init', state: []}, 'mock-description')
			);
			expect(result.current.undo).toBeUndefined();
		});
	});

	describe('its undoLabel property', () => {
		it.todo('reflects the proper change description');
		it.todo("doesn't exist if there isn't a current change");
	});
});

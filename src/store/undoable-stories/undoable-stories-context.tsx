// This context wraps access to a StoriesContext so that changes made can be
// undone. To properly use this, a change should be dispatched via either a
// single action object or a thunk. This context assumes that each dispatch call
// should be treated as a discrete change. If this context is being used, all
// changes should go through this context--the StoriesContext shouldn't be
// accessed directly.

import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {
	StoriesActionOrThunk,
	UndoableStoriesContextProps
} from './undoable-stories.types';
import {reducer} from './reducer';
import {useStoriesContext} from '../stories';

export const UndoableStoriesContext = React.createContext<UndoableStoriesContextProps>(
	{
		dispatch: () => {},
		stories: []
	}
);

UndoableStoriesContext.displayName = 'UndoableStories';

export const useUndoableStoriesContext = () =>
	React.useContext(UndoableStoriesContext);

export const UndoableStoriesContextProvider: React.FC = props => {
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const [state, dispatch] = React.useReducer(reducer, {
		changes: [],
		currentChange: -1
	});
	const dispatchAndRecordStoryAction = React.useCallback(
		(action: StoriesActionOrThunk, description?: string) => {
			if (description) {
				dispatch({
					type: 'addChange',
					action,
					description: description,
					storiesState: stories
				});
			}

			return storiesDispatch(action);
		},
		[stories, storiesDispatch]
	);
	const {t} = useTranslation();

	let redo: (() => void) | undefined = undefined;
	let redoLabel: string | undefined = undefined;
	let undo: (() => void) | undefined = undefined;
	let undoLabel: string | undefined = undefined;

	if (state.changes.length > 0) {
		if (state.currentChange >= 0) {
			undo = () => {
				storiesDispatch(state.changes[state.currentChange].undo);
				dispatch({type: 'updateCurrent', change: -1});
			};
			undoLabel = t('common.undoChange', {
				change: t(state.changes[state.currentChange].description)
			});
		}

		if (state.currentChange < state.changes.length - 1) {
			redo = () => {
				storiesDispatch(state.changes[state.currentChange + 1].redo);
				dispatch({type: 'updateCurrent', change: 1});
			};
			redoLabel = t('common.redoChange', {
				change: t(state.changes[state.currentChange + 1].description)
			});
		}
	}

	return (
		<UndoableStoriesContext.Provider
			value={{
				dispatch: dispatchAndRecordStoryAction,
				redo,
				redoLabel,
				stories,
				undo,
				undoLabel
			}}
		>
			{props.children}
		</UndoableStoriesContext.Provider>
	);
};

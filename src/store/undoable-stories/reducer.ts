// This reducer manages tracking undo states only. It does not actually perform
// the undo/redos itself--that is instead done by
// <UndoableStoriesContextProvider>, which orchestrates things between this
// reducer and the main stories reducer.

import * as React from 'react';
import {reverseAction} from './reverse-action';
import {reverseThunk} from './reverse-thunk';
import {
	StoryChange,
	UndoableStoriesAction,
	UndoableStoriesState
} from './undoable-stories.types';

export const reducer: React.Reducer<
	UndoableStoriesState,
	UndoableStoriesAction
> = (state, action) => {
	switch (action.type) {
		case 'addChange':
			const newChange: StoryChange = {
				description: action.description,
				redo: action.action,
				undo:
					typeof action.action === 'function'
						? reverseThunk(action.action, action.storiesState)
						: reverseAction(action.action, action.storiesState)
			};

			// Slice off any changes after the current one.

			const newChanges = [
				...state.changes.slice(0, state.currentChange + 1),
				newChange
			];

			return {
				changes: newChanges,
				currentChange: newChanges.length - 1
			};

		case 'updateCurrent':
			return {
				...state,
				currentChange: Math.min(
					Math.max(state.currentChange + action.change, -1),
					state.changes.length - 1
				)
			};
	}
};

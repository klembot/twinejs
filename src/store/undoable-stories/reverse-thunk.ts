import * as React from 'react';
import {Thunk} from 'react-hook-thunk-reducer';
import {StoriesAction, StoriesState} from '../stories';
import {reverseAction} from './reverse-action';
import {StoriesActionOrThunk} from './undoable-stories.types';

/**
 * Returns a thunk to reverse a thunk's actions. **This only works with thunks
 * that dispatch all actions synchronously.**
 */
export function reverseThunk(
	thunk: Thunk<StoriesState, StoriesAction>,
	state: StoriesState
): Thunk<StoriesState, StoriesAction> {
	const actions: StoriesActionOrThunk[] = [];
	const dispatch: React.Dispatch<StoriesActionOrThunk> = (
		actionOrThunk: StoriesActionOrThunk
	) => {
		if (typeof actionOrThunk === 'function') {
			actions.push(reverseThunk(actionOrThunk, state));
		} else {
			actions.push(reverseAction(actionOrThunk, state));
		}
	};

	thunk(dispatch, () => state);
	return dispatch => actions.forEach(dispatch);
}

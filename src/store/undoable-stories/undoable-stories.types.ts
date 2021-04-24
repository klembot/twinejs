import {Thunk} from 'react-hook-thunk-reducer';
import {StoriesAction, StoriesState} from '../stories';

export type StoriesActionOrThunk =
	| StoriesAction
	| Thunk<StoriesState, StoriesAction>;

export type UndoableStoriesAction =
	| {
			type: 'addChange';
			action: StoriesActionOrThunk;
			description: string;
			storiesState: StoriesState;
	  }
	| {type: 'updateCurrent'; change: number};

export interface StoryChange {
	/**
	 * A localizable string describing the change.
	 */
	description: string;
	/**
	 * Action or thunk to perform this change again.
	 */
	redo: StoriesActionOrThunk;
	/**
	 * Action or thunk to reverse the effect of this change.
	 */
	undo: StoriesActionOrThunk;
}

export type UndoableStoriesState = {
	/**
	 * Stack of changes, with most recent at the end.
	 */
	changes: StoryChange[];
	/**
	 * Index in `changes` of the current change, or present state.
	 */
	currentChange: number;
};

export type StoriesUndoDispatch = React.Dispatch<UndoableStoriesAction>;

export interface UndoableStoriesContextProps {
	dispatch: (actionOrThunk: StoriesActionOrThunk, annotation?: string) => void;
	redo?: () => void;
	redoLabel?: string;
	stories: StoriesState;
	undo?: () => void;
	undoLabel?: string;
}

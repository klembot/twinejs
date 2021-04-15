import * as React from 'react';
import isEqual from 'lodash/isEqual';

export type DialogType =
	| {type: 'passage'; passageId: string}
	| {type: 'storyJavaScript'}
	| {type: 'storySearch'}
	| {type: 'storyStats'}
	| {type: 'storyStylesheet'};

export type Dialog = DialogType & {collapsed: boolean};

export type DialogsState = Dialog[];

export type DialogsAction =
	| {type: 'addDialog'; dialog: DialogType}
	| {type: 'removeDialog'; index: number}
	| {type: 'setDialogCollapsed'; collapsed: boolean; index: number};

export const reducer: React.Reducer<DialogsState, DialogsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'addDialog':
			// If the dialog has been previously added, expand it. Otherwise, add it
			// to the end.

			let exists = false;
			const editedState = state.map(stateDialog => {
				if (
					isEqual(stateDialog, {
						...action.dialog,
						collapsed: stateDialog.collapsed
					})
				) {
					exists = true;
					return {...stateDialog, collapsed: false};
				}

				return stateDialog;
			});

			if (exists) {
				return editedState;
			}

			return [...state, {...action.dialog, collapsed: false}];

		case 'removeDialog':
			return state.filter((dialog, index) => index !== action.index);

		case 'setDialogCollapsed':
			return state.map((editor, index) =>
				index === action.index
					? {...editor, collapsed: action.collapsed}
					: editor
			);
	}
};

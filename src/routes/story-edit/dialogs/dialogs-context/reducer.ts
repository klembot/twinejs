import * as React from 'react';

interface CommonDialog {
	collapsed: boolean;
}

export type Dialog = CommonDialog &
	(
		| {type: 'passage'; passageId: string}
		| {type: 'storyJavaScript'}
		| {type: 'storyStylesheet'}
	);

export type DialogsState = Dialog[];

export type DialogsAction =
	| {type: 'addPassageEditor'; passageId: string}
	| {type: 'addStoryJavaScriptEditor'}
	| {type: 'addStoryStylesheetEditor'}
	| {type: 'removeDialog'; index: number}
	| {type: 'setDialogCollapsed'; collapsed: boolean; index: number};

export const reducer: React.Reducer<DialogsState, DialogsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'addPassageEditor': {
			let exists = false;
			const editedState = state.map(dialog => {
				if (
					dialog.type === 'passage' &&
					dialog.passageId === action.passageId
				) {
					exists = true;
					return {...dialog, collapsed: false};
				}

				return dialog;
			});

			if (exists) {
				return editedState;
			}

			return [
				...state,
				{collapsed: false, type: 'passage', passageId: action.passageId}
			];
		}

		case 'addStoryJavaScriptEditor': {
			let exists = false;
			const editedState = state.map(dialog => {
				if (dialog.type === 'storyJavaScript') {
					exists = true;
					return {...dialog, collapsed: false};
				}

				return dialog;
			});

			if (exists) {
				return editedState;
			}

			return [...state, {collapsed: false, type: 'storyJavaScript'}];
		}

		case 'addStoryStylesheetEditor': {
			let exists = false;
			const editedState = state.map(dialog => {
				if (dialog.type === 'storyStylesheet') {
					exists = true;
					return {...dialog, collapsed: false};
				}

				return dialog;
			});

			if (exists) {
				return editedState;
			}

			return [...state, {collapsed: false, type: 'storyStylesheet'}];
		}

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

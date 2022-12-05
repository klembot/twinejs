import * as React from 'react';
import isEqual from 'lodash/isEqual';
import {DialogsAction, DialogsState} from '../dialogs.types';

export const reducer: React.Reducer<DialogsState, DialogsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'addDialog':
			// If the dialog has been previously added, expand and/or highlight it.
			// Otherwise, add it to the end.

			let exists = false;
			const editedState = state.map(stateDialog => {
				if (
					isEqual(stateDialog, {
						// Ignore collapsed, highlighted, and maximized properties for comparison.
						collapsed: stateDialog.collapsed,
						component: action.component,
						highlighted: stateDialog.highlighted,
						maximized: stateDialog.maximized,
						props: action.props
					})
				) {
					exists = true;
					return {...stateDialog, collapsed: false, highlighted: true};
				}

				return stateDialog;
			});

			if (exists) {
				return editedState;
			}

			return [
				...state,
				{
					collapsed: false,
					component: action.component,
					highlighted: false,
					maximized: false,
					props: action.props
				}
			];

		case 'removeDialog':
			return state.filter((dialog, index) => index !== action.index);

		case 'setDialogCollapsed':
			return state.map((dialog, index) =>
				index === action.index
					? {...dialog, collapsed: action.collapsed}
					: dialog
			);

		case 'setDialogHighlighted':
			return state.map((dialog, index) =>
				index === action.index
					? {...dialog, highlighted: action.highlighted}
					: dialog
			);

		case 'setDialogMaximized':
			return state.map((dialog, index) => ({
				...dialog,
				maximized: index === action.index ? action.maximized : false
			}));
	}
};

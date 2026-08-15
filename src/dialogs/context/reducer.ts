import * as React from 'react';
import isEqual from 'lodash/isEqual';
import {DialogsAction, DialogsState} from '../dialogs.types';

export const reducer: React.Reducer<DialogsState, DialogsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'addDialog': {
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

			// A dialog opening maximized un-maximizes any other, matching what
			// 'setDialogMaximized' does--only one can be maximized at a time.

			return [
				...(action.maximized
					? state.map(dialog => ({...dialog, maximized: false}))
					: state),
				{
					collapsed: false,
					component: action.component,
					highlighted: false,
					maximized: action.maximized ?? false,
					props: action.props
				}
			];
		}

		case 'removeDialog':
			return state.filter((dialog, index) => index !== action.index);

		case 'setDialogCollapsed':
			return state.map((dialog, index) =>
				index === action.index
					? {
							...dialog,
							collapsed: action.collapsed,
							maximized: action.collapsed ? false : dialog.maximized
					  }
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
				collapsed:
					index === action.index && action.maximized
						? false
						: dialog.collapsed,
				maximized: index === action.index ? action.maximized : false
			}));

		case 'setDialogProps':
			return state.map((dialog, index) => ({
				...dialog,
				props: index === action.index ? action.props : dialog.props
			}));
	}
};

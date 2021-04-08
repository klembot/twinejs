import * as React from 'react';

export interface Editor {
	collapsed: boolean;
}

export interface PassageEditor extends Editor {
	passageId: string;
}

export type EditorsState = PassageEditor[];

export type EditorsAction =
	| {type: 'addPassageEditor'; passageId: string}
	| {type: 'removeEditor'; index: number}
	| {type: 'setEditorCollapsed'; collapsed: boolean; index: number};

export const reducer: React.Reducer<EditorsState, EditorsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'addPassageEditor':
			return [...state, {collapsed: false, passageId: action.passageId}];

		case 'removeEditor':
			return state.filter((editor, index) => index !== action.index);

		case 'setEditorCollapsed':
			return state.map((editor, index) =>
				index === action.index
					? {...editor, collapsed: action.collapsed}
					: editor
			);
	}
};

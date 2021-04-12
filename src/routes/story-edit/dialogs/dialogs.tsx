// These dialogs act as mini-routes within the main story edit one. The storyId
// is passed instead of the story, more or less, to keep the "mini route"
// metaphor intact, and to be able to use getters already defined.
//
// These can't be full-fledged routes because many of them might exist while the
// story is being edited, and we don't want to create browser history when the
// user opens or closes them.
//
// Each dialog is responsible for interacting with the store on their own, to
// avoid putting a pile of functionality here.

import * as React from 'react';
import {useScrollbarSize} from 'react-scrollbar-size';
import {useDialogsContext} from './dialogs-context';
import {PassageDialog} from './passage-dialog';
import {StoryJavaScriptDialog} from './story-javascript-dialog';
import './dialogs.css';

export interface DialogsProps {
	storyId: string;
}

export const Dialogs: React.FC<DialogsProps> = props => {
	const {storyId} = props;
	const {height, width} = useScrollbarSize();
	const {dispatch, dialogs} = useDialogsContext();

	if (dialogs.length === 0) {
		return null;
	}

	const style = {
		marginBottom: height,
		marginRight: width
	};

	return (
		<div className="dialogs" style={style}>
			{dialogs.map((props, index) => {
				switch (props.type) {
					case 'passage':
						return (
							<PassageDialog
								{...props}
								key={props.passageId}
								onChangeCollapsed={(collapsed: boolean) =>
									dispatch({type: 'setDialogCollapsed', collapsed, index})
								}
								onClose={() => dispatch({type: 'removeDialog', index})}
								storyId={storyId}
							/>
						);

					case 'storyJavaScript':
						return (
							<StoryJavaScriptDialog
								{...props}
								onChangeCollapsed={(collapsed: boolean) =>
									dispatch({type: 'setDialogCollapsed', collapsed, index})
								}
								onClose={() => dispatch({type: 'removeDialog', index})}
								storyId={storyId}
							/>
						);
				}
			})}
		</div>
	);
};

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
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {useDialogsContext} from './dialogs-context';
import {PassageDialog} from './passage-dialog';
import {StorySearchDialog} from './story-search-dialog';
import {StoryStatsDialog} from './story-stats-dialog';
import {StoryJavaScriptDialog} from './story-javascript-dialog';
import {StoryStylesheetDialog} from './story-stylesheet-dialog';
import './dialogs.css';

export interface DialogsProps {
	storyId: string;
}

const DialogTransition: React.FC = props => (
	<CSSTransition classNames="pop" timeout={200} {...props}>
		{props.children}
	</CSSTransition>
);

export const Dialogs: React.FC<DialogsProps> = props => {
	const {storyId} = props;
	const {height, width} = useScrollbarSize();
	const {dispatch, dialogs} = useDialogsContext();

	const style: React.CSSProperties = {
		marginBottom: height,
		marginRight: width
	};

	if (dialogs.length === 0) {
		style.pointerEvents = 'none';
	}

	return (
		<div className="dialogs" style={style}>
			<TransitionGroup component={null}>
				{dialogs.map((props, index) => {
					const commonProps = {
						storyId,
						key: props.type,
						onChangeCollapsed: (collapsed: boolean) =>
							dispatch({type: 'setDialogCollapsed', collapsed, index}),
						onClose: () => dispatch({type: 'removeDialog', index})
					};

					switch (props.type) {
						case 'passage':
							return (
								<DialogTransition key={index}>
									<PassageDialog
										{...props}
										{...commonProps}
										key={props.passageId}
									/>
								</DialogTransition>
							);

						case 'storyJavaScript':
							return (
								<DialogTransition key={index}>
									<StoryJavaScriptDialog {...props} {...commonProps} />
								</DialogTransition>
							);

						case 'storySearch':
							return (
								<DialogTransition key={index}>
									<StorySearchDialog {...props} {...commonProps} />
								</DialogTransition>
							);

						case 'storyStats':
							return (
								<DialogTransition key={index}>
									<StoryStatsDialog {...props} {...commonProps} />
								</DialogTransition>
							);

						case 'storyStylesheet':
							return (
								<DialogTransition key={index}>
									<StoryStylesheetDialog {...props} {...commonProps} />
								</DialogTransition>
							);
					}

					// Have to type this as any because TS knows we've exhausted all values
					// in the switch above.

					throw new Error(
						`Don't know how to render dialog type "${(props as any).type}"`
					);
				})}
			</TransitionGroup>
		</div>
	);
};

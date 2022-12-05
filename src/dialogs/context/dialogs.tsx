import * as React from 'react';
import {useScrollbarSize} from 'react-scrollbar-size';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {useDialogsContext} from '.';
import {usePrefsContext} from '../../store/prefs';
import './dialogs.css';

const DialogTransition: React.FC = props => (
	<CSSTransition classNames="pop" timeout={200} {...props}>
		{props.children}
	</CSSTransition>
);

export const Dialogs: React.FC = () => {
	const {height, width} = useScrollbarSize();
	const {prefs} = usePrefsContext();
	const {dispatch, dialogs} = useDialogsContext();

	const hasUnmaximized = dialogs.some(dialog => !dialog.maximized);
	const containerStyle: React.CSSProperties = {
		paddingLeft: `calc(100% - (${prefs.dialogWidth}px + 2 * (var(--grid-size))))`,
		marginBottom: height,
		marginRight: width
	};
	const maximizedStyle: React.CSSProperties = {
		marginRight: hasUnmaximized
			? `calc(${prefs.dialogWidth}px + var(--grid-size))`
			: 0
	};

	return (
		<div className="dialogs" style={containerStyle}>
			<TransitionGroup component={null}>
				{dialogs.map((dialog, index) => {
					const managementProps = {
						collapsed: dialog.collapsed,
						highlighted: dialog.highlighted,
						maximized: dialog.maximized,
						onChangeCollapsed: (collapsed: boolean) =>
							dispatch({type: 'setDialogCollapsed', collapsed, index}),
						onChangeHighlighted: (highlighted: boolean) =>
							dispatch({type: 'setDialogHighlighted', highlighted, index}),
						onChangeMaximized: (maximized: boolean) =>
							dispatch({type: 'setDialogMaximized', maximized, index}),
						onClose: () => dispatch({type: 'removeDialog', index})
					};

					return (
						<DialogTransition key={index}>
							{dialog.maximized ? (
								<div className="maximized" style={maximizedStyle}>
									<dialog.component {...dialog.props} {...managementProps} />
								</div>
							) : (
								<dialog.component {...dialog.props} {...managementProps} />
							)}
						</DialogTransition>
					);
				})}
			</TransitionGroup>
		</div>
	);
};

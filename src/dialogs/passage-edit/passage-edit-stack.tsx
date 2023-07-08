import classNames from 'classnames';
import * as React from 'react';
import {
	BackgroundDialogCard,
	DialogCard
} from '../../components/container/dialog-card';
import {DialogStack} from '../../components/container/dialog-card/dialog-stack';
import {passageWithId, useStoriesContext} from '../../store/stories';
import {
	addPassageEditors,
	removePassageEditors,
	useDialogsContext
} from '../context';
import {DialogComponentProps} from '../dialogs.types';
import {PassageEditContents} from './passage-edit-contents';
import './passage-edit-stack.css';
import {VisibleWhitespace} from '../../components/visible-whitespace';

export interface PassageEditStackProps extends DialogComponentProps {
	passageIds: string[];
	storyId: string;
}

const InnerPassageEditStack: React.FC<PassageEditStackProps> = props => {
	const {onChangeProps, onClose, passageIds, storyId, ...managementProps} =
		props;
	const {dispatch} = useDialogsContext();
	const {stories} = useStoriesContext();

	const passageNames = passageIds.map(
		passageId => passageWithId(stories, storyId, passageId).name
	);

	const style: React.CSSProperties = {};

	if (managementProps.collapsed) {
		style.height = `calc(var(--control-height) * ${passageIds.length})`;

		if (managementProps.maximized) {
			style.bottom = 0;
			style.position = 'absolute';
		}
	}

	function handleClose(
		passageId: string,
		event?: React.KeyboardEvent | React.MouseEvent
	) {
		if (event?.shiftKey) {
			onClose(event);
		} else {
			dispatch(removePassageEditors([passageId]));
		}
	}

	return (
		<div
			className={classNames('passage-edit-stack', {
				collapsed: managementProps.collapsed
			})}
			style={style}
		>
			<DialogStack childKeys={passageIds}>
				{passageIds.map((passageId, index) => {
					if (index !== 0) {
						return (
							<BackgroundDialogCard
								{...managementProps}
								headerDisplayLabel={
									<VisibleWhitespace value={passageNames[index]} />
								}
								headerLabel={passageNames[index]}
								key={passageId}
								onClose={event => handleClose(passageId, event)}
								onRaise={() =>
									dispatch(addPassageEditors(storyId, [passageId]))
								}
							>
								<PassageEditContents
									disabled
									passageId={passageId}
									storyId={storyId}
								/>
							</BackgroundDialogCard>
						);
					}

					return (
						<DialogCard
							{...managementProps}
							headerDisplayLabel={
								<VisibleWhitespace value={passageNames[index]} />
							}
							headerLabel={passageNames[index]}
							key={passageId}
							maximizable
							onClose={event => handleClose(passageId, event)}
						>
							<PassageEditContents passageId={passageId} storyId={storyId} />
						</DialogCard>
					);
				})}
			</DialogStack>
		</div>
	);
};

export const PassageEditStack: React.FC<PassageEditStackProps> = props => {
	const {passageIds, storyId} = props;
	const {stories} = useStoriesContext();

	const existingPassageIds = passageIds.filter(passageId => {
		try {
			passageWithId(stories, storyId, passageId);
		} catch {
			return false;
		}

		return true;
	});

	// If there aren't any passages to display, render nothing and call onClose.

	if (existingPassageIds.length === 0) {
		props.onClose();
		return null;
	}

	// If passages differ from what we were asked to display, change our props.

	if (existingPassageIds.length !== passageIds.length) {
		props.onChangeProps({...props, passageIds: existingPassageIds});
		return null;
	}

	// We're good to display dialogs normally.

	return <InnerPassageEditStack {...props} />;
};

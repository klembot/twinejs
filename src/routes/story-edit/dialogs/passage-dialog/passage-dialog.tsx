import * as React from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {ButtonBar} from '../../../../components/container/button-bar';
import {CheckboxButton} from '../../../../components/control/checkbox-button';
import {
	DialogCard,
	DialogCardProps
} from '../../../../components/container/dialog-card';
import {PassageText} from './passage-text';
import {RenamePassageButton} from './rename-passage-button';
import {TagToolbar} from './tag-toolbar';
import {
	passageWithId,
	storyWithId,
	updatePassage,
	updateStory,
	useStoriesContext
} from '../../../../store/stories';
import './passage-dialog.css';

export interface PassageEditorCardProps
	extends Omit<DialogCardProps, 'headerLabel'> {
	passageId: string;
	storyId: string;
}

export const PassageDialog: React.FC<PassageEditorCardProps> = props => {
	const {passageId, storyId, ...other} = props;
	const {dispatch, stories} = useStoriesContext();
	const passage = passageWithId(stories, storyId, passageId);
	const story = storyWithId(stories, storyId);
	const {t} = useTranslation();

	function handlePassageTextChange(text: string) {
		updatePassage(dispatch, story, passage!, {text});
	}

	function handleSetAsStart() {
		updateStory(dispatch, stories, story, {startPassage: passageId});
	}

	const className = classNames('passage-dialog', {collapsed: other.collapsed});
	const isStart = story.startPassage === passage.id;

	return (
		<div className={className}>
			<DialogCard {...other} headerLabel={passage.name}>
				<ButtonBar>
					<RenamePassageButton passage={passage} story={story} />
					<CheckboxButton
						disabled={isStart}
						label={t('passageEdit.setAsStart')}
						onChange={handleSetAsStart}
						value={isStart}
					/>
				</ButtonBar>
				<TagToolbar passage={passage} story={story} />
				<PassageText onChange={handlePassageTextChange} passage={passage} />
			</DialogCard>
		</div>
	);
};

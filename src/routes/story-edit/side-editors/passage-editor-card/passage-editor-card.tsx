import * as React from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {ButtonBar} from '../../../../components/container/button-bar';
import {CheckboxButton} from '../../../../components/control/checkbox-button';
import {DialogCard} from '../../../../components/container/dialog-card';
import {PassageText} from './passage-text';
import {RenamePassageButton} from './rename-passage-button';
import {TagToolbar} from './tag-toolbar';
import {
	updatePassage,
	updateStory,
	useStoriesContext,
	Story
} from '../../../../store/stories';
import './passage-editor-card.css';

export interface PassageEditorCardProps {
	collapsed: boolean;
	onChangeCollapsed: (value: boolean) => void;
	onClose: () => void;
	passageId: string;
	story: Story;
}

export const PassageEditorCard: React.FC<PassageEditorCardProps> = props => {
	const {collapsed, onChangeCollapsed, onClose, passageId, story} = props;
	const {dispatch, stories} = useStoriesContext();
	const passage = story.passages.find(passage => passage.id === passageId);
	const {t} = useTranslation();

	if (!passage) {
		throw new Error('Passage does not exist in story');
	}

	function handlePassageTextChange(text: string) {
		updatePassage(dispatch, story, passage!, {text});
	}

	function handleSetAsStart() {
		updateStory(dispatch, stories, story, {startPassage: passageId});
	}

	const className = classNames('passage-editor-card', {collapsed});
	const isStart = story.startPassage === passage.id;

	return (
		<div className={className}>
			<DialogCard
				collapsed={collapsed}
				headerLabel={passage.name}
				onChangeCollapsed={onChangeCollapsed}
				onClose={onClose}
			>
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

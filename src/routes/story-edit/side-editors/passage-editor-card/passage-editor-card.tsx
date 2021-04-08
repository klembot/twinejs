import * as React from 'react';
import classNames from 'classnames';
import {EditorCard} from '../../../../components/container/editor-card';
import {PassageText} from './passage-text';
import {
	updatePassage,
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
	const {dispatch} = useStoriesContext();
	const passage = story.passages.find(passage => passage.id === passageId); // FIXME

	if (!passage) {
		throw new Error('Passage does not exist in story');
	}

	const handlePassageTextChange = (text: string) => {
		updatePassage(dispatch, story, passage, {text});
	};

	const className = classNames('passage-editor-card', {collapsed});

	return (
		<div className={className}>
			<EditorCard
				collapsed={collapsed}
				headerLabel={passage.name}
				onChangeCollapsed={onChangeCollapsed}
				onClose={onClose}
			>
				<PassageText onChange={handlePassageTextChange} passage={passage} />
			</EditorCard>
		</div>
	);
};

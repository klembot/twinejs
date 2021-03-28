import * as React from 'react';
import {PromptModal} from '../../../components/modal/prompt-modal';
import {updateStory, Story, useStoriesContext} from '../../../store/stories';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../components/control/icon-button';

export interface RenameStoryButtonProps {
	onCancelRename?: () => void;
	onRename?: (newName: string) => void;
	story: Story;
}

export const RenameStoryButton: React.FC<RenameStoryButtonProps> = props => {
	const {onCancelRename, onRename, story} = props;
	const {dispatch, stories} = useStoriesContext();
	const [modalOpen, setModalOpen] = React.useState(false);
	const [newName, setNewName] = React.useState(story.name);
	const {t} = useTranslation();

	function toggleModal() {
		if (!modalOpen) {
			setNewName(story.name);
		}

		setModalOpen(open => !open);
	}

	function handleCancel() {
		setModalOpen(false);

		if (onCancelRename) {
			onCancelRename();
		}
	}

	function handleRename() {
		updateStory(dispatch, stories, story, {name: newName});
		setModalOpen(false);

		if (onRename) {
			onRename(newName);
		}
	}

	return (
		<>
			<IconButton
				icon="edit-3"
				label={t('storyEdit.topBar.renameStory')}
				onClick={toggleModal}
			/>
			<PromptModal
				domId="rename-story-modal"
				isOpen={modalOpen}
				message={t('common.renameStoryPrompt', {
					name: story.name
				})}
				onChange={e => setNewName(e.target.value)}
				onCancel={handleCancel}
				onSubmit={handleRename}
				value={newName}
			/>
		</>
	);
};

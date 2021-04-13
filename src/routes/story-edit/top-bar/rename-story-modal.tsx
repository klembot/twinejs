import * as React from 'react';
import {PromptModal} from '../../../components/modal/prompt-modal';
import {updateStory, Story, useStoriesContext} from '../../../store/stories';
import {useTranslation} from 'react-i18next';

export interface RenameStoryModalProps {
	onClose: () => void;
	open: boolean;
	story: Story;
}

export const RenameStoryModal: React.FC<RenameStoryModalProps> = props => {
	const {onClose, open, story} = props;
	const {dispatch, stories} = useStoriesContext();
	const [newName, setNewName] = React.useState(story.name);
	const {t} = useTranslation();

	React.useEffect(() => {
		if (open) {
			setNewName(story.name);
		}
	}, [open, story.name]);

	function handleSubmit() {
		updateStory(dispatch, stories, story, {name: newName});
		onClose();
	}

	return (
		<PromptModal
			domId="rename-story-modal"
			isOpen={open}
			message={t('common.renameStoryPrompt', {
				name: story.name
			})}
			onChange={e => setNewName(e.target.value)}
			onCancel={onClose}
			onSubmit={handleSubmit}
			value={newName}
		/>
	);
};

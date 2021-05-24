import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus} from '@tabler/icons';
import {PromptModal} from '../../../components/modal/prompt-modal';
import {IconButton} from '../../../components/control/icon-button';
import {useStoriesContext} from '../../../store/stories';

export const CreateStoryButton: React.FC = () => {
	const [createModalOpen, setCreateModalOpen] = React.useState(false);
	const [newStoryName, setNewStoryName] = React.useState('');
	const {dispatch} = useStoriesContext();
	const {t} = useTranslation();

	function createNewStory() {
		dispatch({
			type: 'createStory',
			props: {name: newStoryName}
		});
		setCreateModalOpen(false);
	}

	return (
		<>
			<IconButton
				icon={<IconPlus />}
				label={t('storyList.topBar.createStory')}
				onClick={() => setCreateModalOpen(open => !open)}
				variant="create"
			/>
			<PromptModal
				detail={t('storyList.topBar.createStoryPromptDetail')}
				domId="create-story-modal"
				isOpen={createModalOpen}
				message={t('storyList.topBar.createStoryPromptMessage')}
				onCancel={() => setCreateModalOpen(false)}
				onChange={event => setNewStoryName(event.target.value)}
				onSubmit={createNewStory}
				submitButtonProps={{
					icon: <IconPlus />,
					label: t('common.create'),
					variant: 'create'
				}}
				value={newStoryName}
			/>
		</>
	);
};

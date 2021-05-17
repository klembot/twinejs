import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconWriting} from '@tabler/icons';
import {IconButton} from '../../components/control/icon-button';
import {PromptModal} from '../../components/modal/prompt-modal';
import {updatePassage, Passage, Story} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';

export interface RenamePassageButtonProps {
	passage: Passage;
	story: Story;
}

export const RenamePassageButton: React.FC<RenamePassageButtonProps> = props => {
	const {passage, story} = props;
	const [newName, setNewName] = React.useState(passage.name);
	const {dispatch} = useUndoableStoriesContext();
	const [renameModalOpen, setRenameModalOpen] = React.useState(false);
	const {t} = useTranslation();

	function renamePassage() {
		dispatch(
			updatePassage(story, passage, {name: newName}),
			'undoChange.renamePassage'
		);
		setRenameModalOpen(false);
	}

	return (
		<>
			<IconButton
				icon={<IconWriting />}
				label={t('common.rename')}
				onClick={() => setRenameModalOpen(true)}
			/>
			<PromptModal
				detail={t('passageEdit.renameDetail')}
				domId="rename-passage-modal"
				isOpen={renameModalOpen}
				message={t('passageEdit.renameMessage')}
				onCancel={() => setRenameModalOpen(false)}
				onChange={event => setNewName(event.target.value)}
				onSubmit={renamePassage}
				submitButtonProps={{label: t('common.save')}}
				value={newName}
			/>
		</>
	);
};

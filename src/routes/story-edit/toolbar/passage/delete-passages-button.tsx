import {IconTrash} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {deletePassages, Passage, Story} from '../../../../store/stories';
import {useUndoableStoriesContext} from '../../../../store/undoable-stories';

export interface DeletePassagesButtonProps {
	passages: Passage[];
	story: Story;
}

export const DeletePassagesButton: React.FC<DeletePassagesButtonProps> = props => {
	const {passages, story} = props;
	const {dispatch} = useUndoableStoriesContext();
	const {t} = useTranslation();

	function handleClick() {
		dispatch(
			deletePassages(story, passages),
			passages.length > 1
				? 'undoChange.deletePassages'
				: 'undoChange.deletePassage'
		);
	}

	return (
		<IconButton
			disabled={passages.length === 0}
			icon={<IconTrash />}
			label={
				passages.length > 1
					? t('common.deleteCount', {count: passages.length})
					: t('common.delete')
			}
			onClick={handleClick}
		/>
	);
};

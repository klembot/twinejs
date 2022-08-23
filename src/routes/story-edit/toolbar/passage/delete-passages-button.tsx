import {IconTrash} from '@tabler/icons';
import 'element-closest';
import * as React from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {deletePassages, Passage, Story} from '../../../../store/stories';
import {useUndoableStoriesContext} from '../../../../store/undoable-stories';

export interface DeletePassagesButtonProps {
	passages: Passage[];
	story: Story;
}

export const DeletePassagesButton: React.FC<
	DeletePassagesButtonProps
> = props => {
	const {passages, story} = props;
	const {dispatch} = useUndoableStoriesContext();
	const {t} = useTranslation();
	const disabled = React.useMemo(() => {
		if (passages.length === 0) {
			return true;
		}

		return passages.some(passage => story.startPassage === passage.id);
	}, [passages, story.startPassage]);
	const handleClick = React.useCallback(() => {
		if (passages.length === 0) {
			return;
		}

		dispatch(
			deletePassages(story, passages),
			passages.length > 1
				? 'undoChange.deletePassages'
				: 'undoChange.deletePassage'
		);
	}, [dispatch, passages, story]);

	useHotkeys('Backspace,Delete', handleClick, [handleClick]);

	return (
		<IconButton
			disabled={disabled}
			icon={<IconTrash />}
			label={
				!disabled && passages.length > 1
					? t('common.deleteCount', {count: passages.length})
					: t('common.delete')
			}
			onClick={handleClick}
		/>
	);
};

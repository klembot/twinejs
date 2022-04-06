import {IconTrash} from '@tabler/icons';
import 'element-closest';
import * as React from 'react';
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

	// Trigger on the delete or backspace key, but only if the user isn't editing
	// text. (This also works if the user has a CodeMirror instance focused.)

	React.useEffect(() => {
		const listener = (event: KeyboardEvent) => {
			if (
				['Backspace', 'Delete'].includes(event.key) &&
				!(event.target as HTMLElement)?.closest('input, textarea')
			) {
				handleClick();
			}
		};

		document.addEventListener('keydown', listener);
		return () => document.removeEventListener('keydown', listener);
	}, [handleClick]);

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

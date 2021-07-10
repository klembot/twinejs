import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconArrowBack, IconArrowForward} from '@tabler/icons';
import {useUndoableStoriesContext} from '../../../store/undoable-stories';
import {IconButton} from '../../../components/control/icon-button';

export const UndoRedoButtons: React.FC = () => {
	const {redo, redoLabel, undo, undoLabel} = useUndoableStoriesContext();
	const {t} = useTranslation();

	return (
		<>
			<IconButton
				disabled={!undo}
				icon={<IconArrowBack />}
				label={undoLabel ?? t('common.undo')}
				onClick={undo}
			/>
			<IconButton
				disabled={!redo}
				icon={<IconArrowForward />}
				label={redoLabel ?? t('common.redo')}
				onClick={redo}
			/>
		</>
	);
};

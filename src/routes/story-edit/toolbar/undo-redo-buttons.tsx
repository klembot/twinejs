import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconArrowBack, IconArrowForward} from '@tabler/icons';
import {useUndoableStoriesContext} from '../../../store/undoable-stories';
import {IconButton} from '../../../components/control/icon-button';
import {useCommand} from '../../../hotkeys';

export const UndoRedoButtons: React.FC = () => {
	const {redo, redoLabel, undo, undoLabel} = useUndoableStoriesContext();
	const {t} = useTranslation();

	// These are bound to mod+z and mod+shift+z in the browser only--in the
	// Electron build, the application menu handles those keys before the
	// renderer sees them. See src/hotkeys/default-keymap.ts.

	useCommand({
		enabled: !!undo,
		id: 'story.undo',
		label: t('common.undo'),
		run: () => undo?.(),
		scope: 'story-map'
	});
	useCommand({
		enabled: !!redo,
		id: 'story.redo',
		label: t('common.redo'),
		run: () => redo?.(),
		scope: 'story-map'
	});

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

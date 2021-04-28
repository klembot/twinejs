import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconArrowBack, IconArrowForward} from '@tabler/icons';
import {IconButton} from '../control/icon-button';

export interface UndoRedoButtonsProps {
	/**
	 * CodeMirror instance to interact with.
	 */
	editor?: CodeMirror.Editor;
	/**
	 * A change in this prop triggers a render (probably, put the editor value
	 * here). This is necessary because the editor instance itself is mutable, so
	 * we need some way of knowing when to re-check whether undo/redo is availble.
	 */
	watch: string;
}

export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = props => {
	const {editor, watch} = props;
	const {t} = useTranslation();
	const [canRedo, setCanRedo] = React.useState(false);
	const [canUndo, setCanUndo] = React.useState(false);

	React.useEffect(() => {
		if (editor) {
			const history = editor.historySize();

			setCanRedo(history.redo > 0);
			setCanUndo(history.undo > 0);
		} else {
			setCanRedo(false);
			setCanUndo(false);
		}
	}, [editor, watch]);

	function execCommand(command: string) {
		editor?.execCommand(command);
		editor?.focus();
	}

	return (
		<>
			<IconButton
				disabled={!canUndo}
				icon={<IconArrowBack />}
				label={t('common.undo')}
				onClick={() => execCommand('undo')}
			/>
			<IconButton
				disabled={!canRedo}
				icon={<IconArrowForward />}
				label={t('common.redo')}
				onClick={() => execCommand('redo')}
			/>
		</>
	);
};

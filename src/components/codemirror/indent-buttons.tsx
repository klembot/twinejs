import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconIndentDecrease, IconIndentIncrease} from '@tabler/icons';
import {IconButton} from '../control/icon-button';

export interface IndentButtonsProps {
	/**
	 * CodeMirror instance to interact with.
	 */
	editor?: CodeMirror.Editor;
}

export const IndentButtons: React.FC<IndentButtonsProps> = props => {
	const {editor} = props;
	const {t} = useTranslation();

	function execCommand(command: string) {
		editor?.execCommand(command);
		editor?.focus();
	}

	return (
		<>
			<IconButton
				disabled={!editor}
				icon={<IconIndentIncrease />}
				label={t('components.indentButtons.indent')}
				onClick={() => execCommand('indentMore')}
			/>
			<IconButton
				disabled={!editor}
				icon={<IconIndentDecrease />}
				label={t('components.indentButtons.unindent')}
				onClick={() => execCommand('indentLess')}
			/>
		</>
	);
};

import {IconFileImport} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';
import {StoryImportDialog, useDialogsContext} from '../../../../dialogs';

export const ImportStoryButton: React.FC = () => {
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();
	const handleClick = React.useCallback(
		() => dispatch({type: 'addDialog', component: StoryImportDialog}),
		[dispatch]
	);

	useCommand({
		id: 'library.import',
		label: t('hotkeys.commands.library.import'),
		run: handleClick,
		scope: 'story-list'
	});

	return (
		<IconButton
			icon={<IconFileImport />}
			label={t('common.import')}
			onClick={handleClick}
		/>
	);
};

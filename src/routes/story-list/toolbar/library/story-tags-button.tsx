import {IconTags} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';
import {StoryTagsDialog, useDialogsContext} from '../../../../dialogs';

export const StoryTagsButton: React.FC = () => {
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();
	const handleClick = React.useCallback(
		() => dispatch({type: 'addDialog', component: StoryTagsDialog}),
		[dispatch]
	);

	useCommand({
		id: 'library.storyTags',
		label: t('hotkeys.commands.library.storyTags'),
		run: handleClick,
		scope: 'story-list'
	});

	return (
		<IconButton
			icon={<IconTags />}
			label={t('routes.storyList.toolbar.storyTags')}
			onClick={handleClick}
		/>
	);
};

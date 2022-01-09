import {IconTags} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {StoryTagsDialog, useDialogsContext} from '../../../../dialogs';

export const StoryTagsButton: React.FC = () => {
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconTags />}
			label={t('routes.storyList.toolbar.storyTags')}
			onClick={() => {
				dispatch({type: 'addDialog', component: StoryTagsDialog});
			}}
		/>
	);
};

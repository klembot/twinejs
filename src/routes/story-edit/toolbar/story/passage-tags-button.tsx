import {IconTags} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {PassageTagsDialog, useDialogsContext} from '../../../../dialogs';
import {Story} from '../../../../store/stories';

export interface PassageTagsButtonProps {
	story: Story;
}

export const PassageTagsButton: React.FC<PassageTagsButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconTags />}
			label={t('routes.storyEdit.toolbar.passageTags')}
			onClick={() =>
				dispatch({
					type: 'addDialog',
					component: PassageTagsDialog,
					props: {storyId: story.id}
				})
			}
		/>
	);
};

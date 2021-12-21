import {IconSearch} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {StorySearchDialog, useDialogsContext} from '../../../../dialogs';
import {Story} from '../../../../store/stories';

export interface FindReplaceButtonProps {
	story: Story;
}

export const FindReplaceButton: React.FC<FindReplaceButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconSearch />}
			label={t('routes.storyEdit.toolbar.findAndReplace')}
			onClick={() =>
				dispatch({
					type: 'addDialog',
					component: StorySearchDialog,
					props: {storyId: story.id}
				})
			}
		/>
	);
};

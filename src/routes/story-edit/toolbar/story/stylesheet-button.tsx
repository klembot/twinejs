import {IconHash} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {StoryStylesheetDialog, useDialogsContext} from '../../../../dialogs';
import {Story} from '../../../../store/stories';

export interface StylesheetButtonProps {
	story: Story;
}

export const StylesheetButton: React.FC<StylesheetButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconHash />}
			label={t('routes.storyEdit.toolbar.stylesheet')}
			onClick={() =>
				dispatch({
					type: 'addDialog',
					component: StoryStylesheetDialog,
					props: {storyId: story.id}
				})
			}
		/>
	);
};

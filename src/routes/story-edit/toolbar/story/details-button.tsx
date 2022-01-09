import {IconInfoCircle} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {StoryDetailsDialog, useDialogsContext} from '../../../../dialogs';
import {Story} from '../../../../store/stories';

export interface DetailsButtonProps {
	story: Story;
}

export const DetailsButton: React.FC<DetailsButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconInfoCircle />}
			label={t('common.details')}
			onClick={() =>
				dispatch({
					type: 'addDialog',
					component: StoryDetailsDialog,
					props: {storyId: story.id}
				})
			}
		/>
	);
};

import {IconInfoCircle} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';
import {StoryDetailsDialog, useDialogsContext} from '../../../../dialogs';
import {Story} from '../../../../store/stories';

export interface DetailsButtonProps {
	story: Story;
}

export const DetailsButton: React.FC<DetailsButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();

	const handleClick = React.useCallback(
		() =>
			dispatch({
				type: 'addDialog',
				component: StoryDetailsDialog,
				props: {storyId: story.id}
			}),
		[dispatch, story.id]
	);

	useCommand({
		id: 'story.details',
		label: t('hotkeys.commands.story.details'),
		run: handleClick,
		scope: 'story-map'
	});

	return (
		<IconButton
			icon={<IconInfoCircle />}
			label={t('common.details')}
			onClick={handleClick}
		/>
	);
};

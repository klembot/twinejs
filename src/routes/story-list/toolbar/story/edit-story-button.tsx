import {IconEdit} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';
import {Story} from '../../../../store/stories';

export interface EditStoryButtonProps {
	story?: Story;
}

export const EditStoryButton: React.FC<EditStoryButtonProps> = ({story}) => {
	const history = useHistory();
	const {t} = useTranslation();
	const handleClick = React.useCallback(
		() => history.push(`/stories/${story?.id}`),
		[history, story?.id]
	);

	useCommand({
		enabled: !!story,
		id: 'story.edit',
		label: t('hotkeys.commands.story.edit'),
		run: handleClick,
		scope: 'story-list'
	});

	return (
		<IconButton
			disabled={!story}
			icon={<IconEdit />}
			label={t('common.edit')}
			onClick={handleClick}
		/>
	);
};

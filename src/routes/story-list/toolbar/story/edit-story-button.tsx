import {IconEdit} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {IconButton} from '../../../../components/control/icon-button';
import {Story} from '../../../../store/stories';

export interface EditStoryButtonProps {
	story?: Story;
}

export const EditStoryButton: React.FC<EditStoryButtonProps> = ({story}) => {
	const history = useHistory();
	const {t} = useTranslation();

	return (
		<IconButton
			disabled={!story}
			icon={<IconEdit />}
			label={t('common.edit')}
			onClick={() => history.push(`/stories/${story?.id}`)}
		/>
	);
};

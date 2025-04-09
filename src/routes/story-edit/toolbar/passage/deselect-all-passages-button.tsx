import {IconMarqueeOff} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {
	deselectAllPassages,
	Story,
	useStoriesContext
} from '../../../../store/stories';

export interface deselectAllPassagesButtonProps {
	story: Story;
}

export const DeselectAllPassagesButton: React.FC<
	deselectAllPassagesButtonProps
> = props => {
	const {story} = props;
	const {dispatch} = useStoriesContext();
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconMarqueeOff />}
			label={t('common.deselectAll')}
			onClick={() => dispatch(deselectAllPassages(story))}
		/>
	);
};

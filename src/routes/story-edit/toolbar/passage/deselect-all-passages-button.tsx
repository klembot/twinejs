import {IconMarqueeOff} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {
	deselectAllPassages,
	Passage,
	Story,
	useStoriesContext
} from '../../../../store/stories';

export interface DeselectAllPassagesButtonProps {
	story: Story;
	selectedPassages: Passage[];
}

export const DeselectAllPassagesButton: React.FC<
	DeselectAllPassagesButtonProps
> = props => {
	const {story, selectedPassages} = props;
	const {dispatch} = useStoriesContext();
	const {t} = useTranslation();

	return (
		<IconButton
			disabled={!selectedPassages.length}
			icon={<IconMarqueeOff />}
			label={t('common.deselectAll')}
			onClick={() => dispatch(deselectAllPassages(story))}
		/>
	);
};

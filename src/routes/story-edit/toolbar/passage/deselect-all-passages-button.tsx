import {IconMarqueeOff} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';
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
	const handleClick = React.useCallback(
		() => dispatch(deselectAllPassages(story)),
		[dispatch, story]
	);

	useCommand({
		enabled: selectedPassages.length > 0,
		id: 'passage.deselectAll',
		label: t('hotkeys.commands.passage.deselectAll'),
		run: handleClick,
		scope: 'story-map'
	});

	return (
		<IconButton
			disabled={!selectedPassages.length}
			icon={<IconMarqueeOff />}
			label={t('common.deselectAll')}
			onClick={handleClick}
		/>
	);
};

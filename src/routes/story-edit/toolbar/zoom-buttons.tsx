import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconGridDots, IconLayoutGrid, IconSquare} from '@tabler/icons';
import {IconButton} from '../../../components/control/icon-button';
import {updateStory, useStoriesContext, Story} from '../../../store/stories';
import './zoom-buttons.css';

export interface ZoomButtonsProps {
	story: Story;
}

export const ZoomButtons: React.FC<ZoomButtonsProps> = React.memo(({story}) => {
	const {dispatch, stories} = useStoriesContext();
	const {t} = useTranslation();

	const handleZoomChange = React.useCallback(
		(zoom: number) => {
			dispatch(updateStory(stories, story, {zoom}));
		},
		[dispatch, stories, story]
	);

	return (
		<div className="zoom-buttons">
			<span className="legend">{t('routes.storyEdit.zoomButtons.legend')}</span>
			<IconButton
				icon={<IconSquare />}
				iconOnly
				label={t('routes.storyEdit.zoomButtons.passageNamesAndExcerpts')}
				onClick={() => handleZoomChange(1)}
				selectable
				selected={story.zoom === 1}
			/>
			<IconButton
				icon={<IconLayoutGrid />}
				iconOnly
				label={t('routes.storyEdit.zoomButtons.passageNames')}
				onClick={() => handleZoomChange(0.6)}
				selectable
				selected={story.zoom === 0.6}
			/>
			<IconButton
				icon={<IconGridDots />}
				iconOnly
				label={t('routes.storyEdit.zoomButtons.storyStructure')}
				onClick={() => handleZoomChange(0.3)}
				selectable
				selected={story.zoom === 0.3}
			/>
		</div>
	);
});

ZoomButtons.displayName = 'ZoomButtons';

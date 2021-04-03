import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../components/control/icon-button';
import {
	minZoom,
	maxZoom,
	updateStory,
	useStoriesContext,
	Story
} from '../../../store/stories';

export interface ZoomButtonsProps {
	story: Story;
}

export const ZoomButtons: React.FC<ZoomButtonsProps> = ({story}) => {
	const {dispatch, stories} = useStoriesContext();
	const {t} = useTranslation();

	const handleZoomChange = React.useCallback(
		(change: number) => {
			updateStory(dispatch, stories, story, {zoom: story.zoom + change});
		},
		[dispatch, stories, story]
	);

	return (
		<>
			<IconButton
				disabled={story.zoom >= maxZoom}
				icon="zoom-in"
				label={t('storyEdit.topBar.zoomIn')}
				onClick={() => handleZoomChange(0.2)}
			/>
			<IconButton
				disabled={story.zoom <= minZoom}
				icon="zoom-out"
				label={t('storyEdit.topBar.zoomOut')}
				onClick={() => handleZoomChange(-0.2)}
			/>
		</>
	);
};

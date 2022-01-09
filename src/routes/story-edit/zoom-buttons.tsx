import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconZoomIn} from '@tabler/icons';
import {IconZoomOut} from '../../components/image/icon';
import {IconButton} from '../../components/control/icon-button';
import {
	minZoom,
	maxZoom,
	updateStory,
	useStoriesContext,
	Story
} from '../../store/stories';
import {ButtonCard} from '../../components/container/button-card';
import './zoom-buttons.css';
import {useScrollbarSize} from 'react-scrollbar-size';

export interface ZoomButtonsProps {
	story: Story;
}

export const ZoomButtons: React.FC<ZoomButtonsProps> = ({story}) => {
	const {dispatch, stories} = useStoriesContext();
	const {t} = useTranslation();
	const {height} = useScrollbarSize();

	const handleZoomChange = React.useCallback(
		(change: number) => {
			dispatch(updateStory(stories, story, {zoom: story.zoom + change}));
		},
		[dispatch, stories, story]
	);

	const style: React.CSSProperties = {
		marginBottom: height
	};

	return (
		<div className="zoom-buttons" style={style}>
			<ButtonCard>
				<IconButton
					disabled={story.zoom >= maxZoom}
					icon={<IconZoomIn />}
					iconOnly
					label={t('routes.storyEdit.zoomIn')}
					onClick={() => handleZoomChange(0.2)}
				/>
				<IconButton
					disabled={story.zoom <= minZoom}
					icon={<IconZoomOut />}
					iconOnly
					label={t('routes.storyEdit.zoomOut')}
					onClick={() => handleZoomChange(-0.2)}
				/>
			</ButtonCard>
		</div>
	);
};

import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconGridDots, IconLayoutGrid, IconSquare} from '@tabler/icons';
import {IconButton} from '../../components/control/icon-button';
import {updateStory, useStoriesContext, Story} from '../../store/stories';
import {ButtonCard} from '../../components/container/button-card';
import './zoom-buttons.css';
import {useScrollbarSize} from 'react-scrollbar-size';

export interface ZoomButtonsProps {
	story: Story;
}

export const ZoomButtons: React.FC<ZoomButtonsProps> = React.memo(({story}) => {
	const {dispatch, stories} = useStoriesContext();
	const {t} = useTranslation();
	const {height} = useScrollbarSize();

	const handleZoomChange = React.useCallback(
		(zoom: number) => {
			dispatch(updateStory(stories, story, {zoom}));
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
					icon={<IconSquare />}
					iconOnly
					label={t('routes.storyEdit.zoomButtons.passageNamesAndExcerpts')}
					onClick={() => handleZoomChange(1)}
					selectable
					selected={story.zoom === 1}
					tooltipPosition="right"
				/>
				<IconButton
					icon={<IconLayoutGrid />}
					iconOnly
					label={t('routes.storyEdit.zoomButtons.passageNames')}
					onClick={() => handleZoomChange(0.6)}
					selectable
					selected={story.zoom === 0.6}
					tooltipPosition="right"
				/>
				<IconButton
					icon={<IconGridDots />}
					iconOnly
					label={t('routes.storyEdit.zoomButtons.storyStructure')}
					onClick={() => handleZoomChange(0.3)}
					selectable
					selected={story.zoom === 0.3}
					tooltipPosition="right"
				/>
			</ButtonCard>
		</div>
	);
});

ZoomButtons.displayName = 'ZoomButtons';
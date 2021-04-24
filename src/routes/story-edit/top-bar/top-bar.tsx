import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {TopBar} from '../../../components/container/top-bar';
import {IconButton} from '../../../components/control/icon-button';
import {Story} from '../../../store/stories';
import {useStoryLaunch} from '../../../store/use-story-launch';
import {Point} from '../../../util/geometry';
import {CreatePassageButton} from './create-passage-button';
import {MoreMenu} from './more-menu';
import {UndoRedoButtons} from './undo-redo-buttons';
import {ZoomButtons} from './zoom-buttons';

export interface StoryEditTopBarProps {
	getCenter: () => Point;
	story: Story;
}

export const StoryEditTopBar: React.FC<StoryEditTopBarProps> = props => {
	const {getCenter, story} = props;
	const {playStory, testStory} = useStoryLaunch();
	const history = useHistory();
	const {t} = useTranslation();

	return (
		<TopBar>
			<IconButton
				icon="arrow-left"
				label={t('storyList.title')}
				onClick={() => history.push('/')}
				variant="primary"
			/>
			<CreatePassageButton getCenter={getCenter} story={story} />
			<ZoomButtons story={story} />
			<IconButton
				icon="play"
				label={t('common.play')}
				onClick={() => playStory(story.id)}
			/>
			<IconButton
				icon="tool"
				label={t('common.test')}
				onClick={() => testStory(story.id)}
			/>
			<UndoRedoButtons />
			<MoreMenu story={story} />
		</TopBar>
	);
};

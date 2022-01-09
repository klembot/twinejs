import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {RouteToolbar} from '../../../components/route-toolbar';
import {AppActions, BuildActions} from '../../../route-actions';
import {Story} from '../../../store/stories';
import {Point} from '../../../util/geometry';
import {PassageActions} from './passage/passage-actions';
import {StoryActions} from './story/story-actions';
import {UndoRedoButtons} from './undo-redo-buttons';

export interface StoryEditToolbarProps {
	getCenter: () => Point;
	story: Story;
}

export const StoryEditToolbar: React.FC<StoryEditToolbarProps> = props => {
	const {getCenter, story} = props;
	const {t} = useTranslation();

	return (
		<RouteToolbar
			pinnedControls={<UndoRedoButtons />}
			tabs={{
				[t('common.passage')]: (
					<PassageActions getCenter={getCenter} story={story} />
				),
				[t('common.story')]: <StoryActions story={story} />,
				[t('common.build')]: <BuildActions story={story} />,
				[t('common.appName')]: <AppActions />
			}}
		/>
	);
};

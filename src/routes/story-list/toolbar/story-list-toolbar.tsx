import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {RouteToolbar} from '../../../components/route-toolbar';
import {StorageQuota} from '../../../components/storage-quota/storage-quota';
import {BuildActions, AppActions} from '../../../route-actions';
import {Story, useStoriesContext} from '../../../store/stories';
import {LibraryActions} from './library/library-actions';
import {StoryActions} from './story/story-actions';
import {ViewActions} from './view/view-actions';

export interface StoryListToolbarProps {
	selectedStories: Story[];
}

export const StoryListToolbar: React.FC<StoryListToolbarProps> = props => {
	const {selectedStories} = props;
	const {stories} = useStoriesContext();
	const {t} = useTranslation();
	const selectedStory =
		selectedStories.length === 1 ? selectedStories[0] : undefined;

	return (
		<RouteToolbar
			pinnedControls={<StorageQuota watch={stories} />}
			tabs={{
				[t('common.story')]: <StoryActions selectedStory={selectedStory} />,
				[t('routes.storyList.library')]: <LibraryActions />,
				[t('common.build')]: <BuildActions story={selectedStory} />,
				[t('common.view')]: <ViewActions />,
				[t('common.appName')]: <AppActions />
			}}
		/>
	);
};

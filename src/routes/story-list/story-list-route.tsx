import sortBy from 'lodash/sortBy';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {MainContent} from '../../components/container/main-content';
import {
	AppDonationDialog,
	DialogsContextProvider,
	useDialogsContext
} from '../../dialogs';
import {usePrefsContext} from '../../store/prefs';
import {Story, useStoriesContext} from '../../store/stories';
import {UndoableStoriesContextProvider} from '../../store/undoable-stories';
import {useDonationCheck} from '../../store/prefs/use-donation-check';
import {usePublishing} from '../../store/use-publishing';
import {storyFileName} from '../../electron/shared';
import {saveHtml} from '../../util/save-html';
import {StoryCards} from './story-cards';
import {SafariWarningCard} from '../../components/safari-warning';
import {StoryListTopBar} from './top-bar/top-bar';

export const InnerStoryListRoute: React.FC = () => {
	const {dispatch} = useDialogsContext();
	const {stories} = useStoriesContext();
	const {prefs} = usePrefsContext();
	const {publishStory} = usePublishing();
	const {shouldShowDonationPrompt} = useDonationCheck();
	const {t} = useTranslation();

	const visibleStories = React.useMemo(() => {
		const filteredStories =
			prefs.storyListTagFilter.length > 0
				? stories.filter(story =>
						story.tags.some(tag => prefs.storyListTagFilter.includes(tag))
				  )
				: stories;

		switch (prefs.storyListSort) {
			case 'date':
				return sortBy(filteredStories, 'lastUpdated');
			case 'name':
				return sortBy(filteredStories, 'name');
		}
	}, [prefs.storyListSort, prefs.storyListTagFilter, stories]);

	async function handlePublish(story: Story) {
		saveHtml(await publishStory(story.id), storyFileName(story));
	}

	React.useEffect(() => {
		if (shouldShowDonationPrompt()) {
			dispatch({type: 'addDialog', component: AppDonationDialog});
		}
	}, [dispatch, shouldShowDonationPrompt]);

	return (
		<div className="story-list-route">
			<StoryListTopBar stories={stories} />
			<MainContent
				title={t(
					prefs.storyListTagFilter.length > 0
						? 'routes.storyList.taggedTitleCount'
						: 'routes.storyList.titleCount',
					{count: visibleStories.length}
				)}
			>
				<SafariWarningCard />
				<div className="stories">
					{stories.length === 0 ? (
						<p>{t('routes.storyList.noStories')}</p>
					) : (
						<StoryCards onPublish={handlePublish} stories={visibleStories} />
					)}
				</div>
			</MainContent>
		</div>
	);
};

export const StoryListRoute: React.FC = () => (
	<UndoableStoriesContextProvider>
		<DialogsContextProvider>
			<InnerStoryListRoute />
		</DialogsContextProvider>
	</UndoableStoriesContextProvider>
);

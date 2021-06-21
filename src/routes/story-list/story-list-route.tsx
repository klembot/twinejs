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
import {useDonationCheck} from '../../store/use-donation-check';
import {usePublishing} from '../../store/use-publishing';
import {storyFilename} from '../../util/publish';
import {saveHtml} from '../../util/save-html';
import {StoryCards} from './story-cards';
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
		saveHtml(await publishStory(story.id), storyFilename(story));
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
						? 'storyList.taggedTitleCount'
						: 'storyList.titleCount',
					{count: visibleStories.length}
				)}
			>
				<div className="stories">
					{stories.length === 0 ? (
						<p>{t('storyList.noStories')}</p>
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

import * as React from 'react';
import {useTranslation} from 'react-i18next';
import sortBy from 'lodash/sortBy';
import {MainContent} from '../../components/container/main-content';
import {updateStory, useStoriesContext, Story} from '../../store/stories';
import {usePublishing} from '../../store/use-publishing';
import {StoryListTopBar} from './top-bar/top-bar';
import {StoryCards} from './story-cards';
import {usePrefsContext} from '../../store/prefs';
import {UndoableStoriesContextProvider} from '../../store/undoable-stories';
import {storyFilename} from '../../util/publish';
import {saveHtml} from '../../util/save-html';

export const StoryListRoute: React.FC = () => {
	const {dispatch, stories} = useStoriesContext();
	const {prefs} = usePrefsContext();
	const {publishStory} = usePublishing();
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

	function handleRename(story: Story, name: string) {
		dispatch(updateStory(stories, story, {name}));
	}

	return (
		<div className="story-list-route">
			<UndoableStoriesContextProvider>
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
							<>
								<StoryCards
									onPublish={handlePublish}
									onRename={handleRename}
									stories={visibleStories}
								/>
							</>
						)}
					</div>
				</MainContent>
			</UndoableStoriesContextProvider>
		</div>
	);
};

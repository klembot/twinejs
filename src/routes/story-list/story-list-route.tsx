import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {MainContent} from '../../components/container/main-content';
import {updateStory, useStoriesContext, Story} from '../../store/stories';
import {usePublishing} from '../../store/use-publishing';
import {StoryListTopBar} from './top-bar/top-bar';
import {StoryCards} from './story-cards';
import {storyFilename} from '../../util/publish';
import {saveHtml} from '../../util/save-html';

export const StoryListRoute: React.FC = () => {
	const {dispatch, stories} = useStoriesContext();
	const {publishStory} = usePublishing();
	const {t} = useTranslation();

	async function handlePublish(story: Story) {
		saveHtml(await publishStory(story.id), storyFilename(story));
	}

	function handleRename(story: Story, name: string) {
		updateStory(dispatch, stories, story, {name});
	}

	return (
		<div className="story-list-route">
			<StoryListTopBar />
			<MainContent
				title={t('storyList.titleCount', {count: stories.length})}
			>
				{stories.length === 0 ? (
					<p>{t('storyList.noStories')}</p>
				) : (
					<StoryCards
						onPublish={handlePublish}
						onRename={handleRename}
						stories={stories}
					/>
				)}
			</MainContent>
		</div>
	);
};

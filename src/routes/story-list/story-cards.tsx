import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {CardGroup} from '../../components/container/card-group';
import {StoryCard} from '../../components/story/story-card';
import {setPref, usePrefsContext} from '../../store/prefs';
import {
	deleteStory,
	duplicateStory,
	renameStoryTag,
	updateStory,
	Story
} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {useStoryLaunch} from '../../store/use-story-launch';
import {Color} from '../../util/color';

/**
 * How wide a story card should render onscreen as.
 */
const cardWidth = '360px';

export interface StoryCardsProps {
	onPublish: (story: Story) => void;
	stories: Story[];
}

export const StoryCards: React.FC<StoryCardsProps> = props => {
	const {onPublish, stories} = props;
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch} = useUndoableStoriesContext();
	const history = useHistory();
	const {playStory, testStory} = useStoryLaunch();

	function handleAddTag(story: Story, tagName: string, tagColor?: Color) {
		storiesDispatch(
			updateStory(stories, story, {
				tags: story.tags ? [...story.tags, tagName] : [tagName]
			})
		);

		if (tagColor) {
			prefsDispatch(
				setPref('storyTagColors', {
					...prefs.storyTagColors,
					[tagName]: tagColor
				})
			);
		}
	}

	function handleChangeTagColor(tagName: string, color: Color) {
		prefsDispatch(
			setPref('storyTagColors', {
				...prefs.storyTagColors,
				[tagName]: color
			})
		);
	}

	function handleDelete(story: Story) {
		storiesDispatch(deleteStory(story));
	}

	function handleDuplicate(story: Story) {
		storiesDispatch(duplicateStory(story, stories));
	}

	function handleRemoveTag(story: Story, tagName: string) {
		storiesDispatch(
			updateStory(stories, story, {
				tags: story.tags.filter(tag => tag !== tagName)
			})
		);
	}

	function handleRename(story: Story, name: string) {
		storiesDispatch(updateStory(stories, story, {name}));
	}

	return (
		<>
			<CardGroup columnWidth={cardWidth}>
				{stories.map(story => (
					<StoryCard
						allStories={stories}
						key={story.id}
						onAddTag={(name, color) => handleAddTag(story, name, color)}
						onChangeTagColor={handleChangeTagColor}
						onDelete={() => handleDelete(story)}
						onDuplicate={() => handleDuplicate(story)}
						onEdit={() => history.push(`/stories/${story.id}`)}
						onPublish={() => onPublish(story)}
						onPlay={() => playStory(story.id)}
						onRemoveTag={name => handleRemoveTag(story, name)}
						onRename={name => handleRename(story, name)}
						onTest={() => testStory(story.id)}
						story={story}
						storyTagColors={prefs.storyTagColors}
					/>
				))}
			</CardGroup>
		</>
	);
};

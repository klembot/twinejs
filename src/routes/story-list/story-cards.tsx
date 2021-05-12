import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import sortBy from 'lodash/sortBy';
import {CardGroup} from '../../components/container/card-group';
import {StoryCard} from '../../components/story/story-card';
import {PromptModal} from '../../components/modal/prompt-modal';
import {setPref, usePrefsContext} from '../../store/prefs';
import {renameStoryTag, updateStory, Story} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {useStoryLaunch} from '../../store/use-story-launch';
import {Color} from '../../util/color';

/**
 * How wide a story card should render onscreen as.
 */
const cardWidth = '350px';

export interface StoryCardsProps {
	onPublish: (story: Story) => void;
	onRename: (story: Story, newName: string) => void;
}

// TODO: set story name in rename prompt, validate new value

export const StoryCards: React.FC<StoryCardsProps> = props => {
	const {onPublish, onRename} = props;
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch, stories} = useUndoableStoriesContext();
	const [renameStory, setRenameStory] = React.useState<Story>();
	const [renameNewName, setRenameNewName] = React.useState('');
	const history = useHistory();
	const {playStory, testStory} = useStoryLaunch();
	const {t} = useTranslation();

	const sortedStories = React.useMemo(() => {
		switch (prefs.storyListSort) {
			case 'date':
				return sortBy(stories, 'lastUpdated');
			case 'name':
				return sortBy(stories, 'name');
		}
	}, [prefs.storyListSort, stories]);

	function handleAddTag(story: Story, tagName: string, tagColor: Color) {
		storiesDispatch(
			updateStory(stories, story, {
				tags: story.tags ? [...story.tags, tagName] : [tagName]
			})
		);
		prefsDispatch(
			setPref('storyTagColors', {...prefs.storyTagColors, [tagName]: tagColor})
		);
	}

	// TODO: add delete handler
	// TODO: maybe style tag buttons differently?

	function handleEditTag(
		story: Story,
		oldName: string,
		newName: string,
		newColor: Color
	) {
		storiesDispatch(renameStoryTag(stories, oldName, newName));
		prefsDispatch(
			setPref('storyTagColors', {...prefs.storyTagColors, [newName]: newColor})
		);
	}

	function handleRename() {
		if (!renameStory || !renameNewName) {
			throw new Error('Missing story or name to rename to.');
		}

		onRename(renameStory, renameNewName);
		setRenameStory(undefined);
	}

	return (
		<>
			<CardGroup columnWidth={cardWidth}>
				{sortedStories.map(story => (
					<StoryCard
						key={story.id}
						onAddTag={(name, color) => handleAddTag(story, name, color)}
						onEditTag={(oldName, newName, newColor) =>
							handleEditTag(story, oldName, newName, newColor)
						}
						onEdit={() => history.push(`/stories/${story.id}`)}
						onPublish={() => onPublish(story)}
						onPlay={() => playStory(story.id)}
						onRename={() => setRenameStory(story)}
						onTest={() => testStory(story.id)}
						story={story}
						storyTagColors={prefs.storyTagColors}
					/>
				))}
			</CardGroup>
			<PromptModal
				domId="rename-story-modal"
				message={t('common.renameStoryPrompt', {
					name: renameStory?.name
				})}
				isOpen={!!renameStory}
				onCancel={() => setRenameStory(undefined)}
				onChange={e => setRenameNewName(e.target.value)}
				onSubmit={handleRename}
				value={renameNewName}
			/>
		</>
	);
};

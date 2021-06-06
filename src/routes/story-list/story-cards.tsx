import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {CardGroup} from '../../components/container/card-group';
import {StoryCard} from '../../components/story/story-card';
import {PromptModal} from '../../components/modal/prompt-modal';
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
const cardWidth = '350px';

export interface StoryCardsProps {
	onPublish: (story: Story) => void;
	onRename: (story: Story, newName: string) => void;
	stories: Story[];
}

// TODO: set story name in rename prompt, validate new value

export const StoryCards: React.FC<StoryCardsProps> = props => {
	const {onPublish, onRename, stories} = props;
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch} = useUndoableStoriesContext();
	const [renameStory, setRenameStory] = React.useState<Story>();
	const [renameNewName, setRenameNewName] = React.useState('');
	const history = useHistory();
	const {playStory, testStory} = useStoryLaunch();
	const {t} = useTranslation();

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

	function handleDelete(story: Story) {
		storiesDispatch(deleteStory(story));
	}

	function handleDuplicate(story: Story) {
		storiesDispatch(duplicateStory(story, stories));
	}

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
				{stories.map(story => (
					<StoryCard
						key={story.id}
						onAddTag={(name, color) => handleAddTag(story, name, color)}
						onDelete={() => handleDelete(story)}
						onDuplicate={() => handleDuplicate(story)}
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

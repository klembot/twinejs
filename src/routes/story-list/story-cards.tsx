import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {CardGroup} from '../../components/container/card-group';
import {StoryCard} from '../../components/story/story-card';
import {setPref, usePrefsContext} from '../../store/prefs';
import {Story, updateStory} from '../../store/stories';
import {repairStory} from '../../store/stories/reducer/repair/repair-story';
import {
	formatWithNameAndVersion,
	useStoryFormatsContext
} from '../../store/story-formats';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Color} from '../../util/color';

/**
 * How wide a story card should render onscreen as.
 */
const cardWidth = '360px';

export interface StoryCardsProps {
	onSelectStory: (story: Story) => void;
	stories: Story[];
}

export const StoryCards: React.FC<StoryCardsProps> = props => {
	const {onSelectStory, stories} = props;
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch} = useUndoableStoriesContext();
	const {formats} = useStoryFormatsContext();
	const history = useHistory();

	function handleChangeTagColor(tagName: string, color: Color) {
		prefsDispatch(
			setPref('storyTagColors', {
				...prefs.storyTagColors,
				[tagName]: color
			})
		);
	}

	function handleRemoveTag(story: Story, tagName: string) {
		storiesDispatch(
			updateStory(stories, story, {
				tags: story.tags.filter(tag => tag !== tagName)
			})
		);
	}

	function handleEdit(story: Story) {
		const defaultFormat = formatWithNameAndVersion(
			formats,
			prefs.storyFormat.name,
			prefs.storyFormat.version
		);

		storiesDispatch(
			updateStory(
				stories,
				story,
				repairStory(story, stories, formats, defaultFormat)
			)
		);

		return history.push(`/stories/${story.id}`);
	}

	return (
		<>
			<CardGroup columnWidth={cardWidth}>
				<TransitionGroup component={null}>
					{stories.map(story => (
						<CSSTransition classNames="pop" key={story.id} timeout={200}>
							<StoryCard
								onChangeTagColor={handleChangeTagColor}
								onEdit={() => handleEdit(story)}
								onRemoveTag={name => handleRemoveTag(story, name)}
								onSelect={() => onSelectStory(story)}
								story={story}
								storyTagColors={prefs.storyTagColors}
							/>
						</CSSTransition>
					))}
				</TransitionGroup>
			</CardGroup>
		</>
	);
};

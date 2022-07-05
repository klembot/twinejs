import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {CardGroup} from '../../components/container/card-group';
import {StoryCard} from '../../components/story/story-card';
import {setPref, usePrefsContext} from '../../store/prefs';
import {Story, updateStory} from '../../store/stories';
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

	return (
		<>
			<CardGroup columnWidth={cardWidth}>
				<TransitionGroup component={null}>
					{stories.map(story => (
						<CSSTransition classNames="pop" key={story.id} timeout={200}>
							<StoryCard
								onChangeTagColor={handleChangeTagColor}
								onEdit={() => history.push(`/stories/${story.id}`)}
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

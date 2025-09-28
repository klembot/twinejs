import * as React from 'react';
import {setPref, usePrefsContext} from '../../../../store/prefs';
import {
	Story,
	storyTags,
	updateStory,
	useStoriesContext
} from '../../../../store/stories';
import {TagCardButton} from '../../../../components/tag/tag-card-button';
import {Color} from '../../../../util/color';

export interface TagStoryButtonProps {
	story?: Story;
}

export const TagStoryButton: React.FC<TagStoryButtonProps> = props => {
	const {story} = props;
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const allStoryTags = storyTags(stories);

	function handleAddTag(name: string) {
		if (!story) {
			throw new Error('Story is unset');
		}

		storiesDispatch(
			updateStory(stories, story, {
				tags: story.tags ? [...story.tags, name] : [name]
			})
		);
	}

	function handleChangeTagColor(name: string, color: Color) {
		prefsDispatch(
			setPref('storyTagColors', {...prefs.storyTagColors, [name]: color})
		);
	}

	function handleRemoveTag(name: string) {
		if (!story) {
			throw new Error('Story is unset');
		}

		storiesDispatch(
			updateStory(stories, story, {
				tags: story.tags.filter(tag => tag !== name)
			})
		);
	}

	return (
		<TagCardButton
			allTags={allStoryTags}
			disabled={!story}
			onAdd={handleAddTag}
			onChangeColor={handleChangeTagColor}
			onRemove={handleRemoveTag}
			tagColors={{}}
			tags={story?.tags ?? []}
		/>
	);
};

import {IconTag} from '@tabler/icons';
import * as React from 'react';
import {AddTagButton} from '../../../../components/tag';
import {setPref, usePrefsContext} from '../../../../store/prefs';
import {
	Story,
	storyTags,
	updateStory,
	useStoriesContext
} from '../../../../store/stories';

export interface TagStoryButtonProps {
	story?: Story;
}

export const TagStoryButton: React.FC<TagStoryButtonProps> = props => {
	const {story} = props;
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch, stories} = useStoriesContext();

	function handleAddTag(tagName: string, tagColor?: string) {
		if (!story) {
			throw new Error('Story is unset');
		}

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

	return (
		<AddTagButton
			assignedTags={story?.tags ?? []}
			disabled={!story}
			existingTags={storyTags(stories)}
			icon={<IconTag />}
			onAdd={handleAddTag}
		/>
	);
};

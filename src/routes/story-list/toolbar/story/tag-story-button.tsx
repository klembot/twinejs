import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {setPref, usePrefsContext} from '../../../../store/prefs';
import {
	Story,
	storyTags,
	updateStory,
	useStoriesContext
} from '../../../../store/stories';
import {TagCardButton} from '../../../../components/tag/tag-card-button';
import {useCommand} from '../../../../hotkeys';
import {Color, colorString} from '../../../../util/color';

export interface TagStoryButtonProps {
	story?: Story;
}

export const TagStoryButton: React.FC<TagStoryButtonProps> = props => {
	const {story} = props;
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const allStoryTags = storyTags(stories);
	const [tagCardOpen, setTagCardOpen] = React.useState(false);
	const {t} = useTranslation();

	useCommand({
		enabled: !!story,
		id: 'story.tag',
		label: t('hotkeys.commands.story.tag'),
		run: () => setTagCardOpen(true),
		scope: 'story-list'
	});

	function handleAddTag(name: string) {
		if (!story) {
			throw new Error('Story is unset');
		}

		// If this is the first time we're assigning this tag to a story, set a
		// color for it in preferences.

		if (!storyTags(stories).includes(name)) {
			prefsDispatch(
				setPref('storyTagColors', {
					...prefs.storyTagColors,
					[name]: colorString(name)
				})
			);
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
			id={`story-tag-input-${story?.id ?? 'none'}`}
			onAdd={handleAddTag}
			onChangeColor={handleChangeTagColor}
			onChangeOpen={setTagCardOpen}
			open={tagCardOpen}
			onRemove={handleRemoveTag}
			tagColors={{}}
			tags={story?.tags ?? []}
		/>
	);
};

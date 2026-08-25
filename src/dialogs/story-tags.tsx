import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {DialogCard} from '../components/container/dialog-card';
import {CardContent} from '../components/container/card';
import {DialogComponentProps} from './dialogs.types';
import {deleteTagFromAllStories, renameStoryTag, storyTags} from '../store/stories';
import {setPref, usePrefsContext} from '../store/prefs';
import {useUndoableStoriesContext} from '../store/undoable-stories';
import {Color} from '../util/color';
import {TagEditor} from '../components/tag/tag-editor';

export type StoryTagsDialogProps = DialogComponentProps;

export const StoryTagsDialog: React.FC<StoryTagsDialogProps> = props => {
	const {dispatch: storiesDispatch, stories} = useUndoableStoriesContext();
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	const tags = storyTags(stories);

	function handleChangeColor(tagName: string, color: Color) {
		prefsDispatch(
			setPref('storyTagColors', {...prefs.storyTagColors, [tagName]: color})
		);
	}

	function handleChangeTagName(tagName: string, newName: string) {
		storiesDispatch(renameStoryTag(stories, tagName, newName));
	}

	function handleDeleteTag(tagName: string) {
		// Remove tag from all stories and passages
		storiesDispatch(deleteTagFromAllStories(stories, tagName));
		
		// Clean up tag color from preferences
		if (prefs.storyTagColors[tagName]) {
			const newTagColors = {...prefs.storyTagColors};
			delete newTagColors[tagName];
			prefsDispatch(setPref('storyTagColors', newTagColors));
		}
	}

	return (
		<DialogCard
			className="story-tags-dialog"
			fixedSize
			headerLabel={t('dialogs.storyTags.title')}
			{...props}
		>
			<CardContent>
				{tags.length > 0 ? (
					tags.map(tag => (
						<TagEditor
							allTags={tags}
							color={prefs.storyTagColors[tag]}
							key={tag}
							name={tag}
							onChangeColor={color => handleChangeColor(tag, color)}
							onChangeName={newName => handleChangeTagName(tag, newName)}
							onDelete={() => handleDeleteTag(tag)}
							deleteMessageKey="components.tagEditor.deleteTagGlobal"
						/>
					))
				) : (
					<p>{t('dialogs.storyTags.noTags')}</p>
				)}
			</CardContent>
		</DialogCard>
	);
};

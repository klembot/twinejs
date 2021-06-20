import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {DialogCard} from '../components/container/dialog-card';
import {CardContent} from '../components/container/card';
import {DialogComponentProps} from './dialogs.types';
import {
	setTagColor,
	storyWithId,
	renamePassageTag,
	storyPassageTags
} from '../store/stories';
import {useUndoableStoriesContext} from '../store/undoable-stories';
import {Color} from '../util/color';
import {TagEditor} from '../components/tag/tag-editor';

export interface PassageTagsDialogProps extends DialogComponentProps {
	storyId: string;
}

export const PassageTagsDialog: React.FC<PassageTagsDialogProps> = props => {
	const {storyId, ...other} = props;
	const {dispatch, stories} = useUndoableStoriesContext();
	const {t} = useTranslation();

	const story = storyWithId(stories, storyId);
	const tags = storyPassageTags(story);

	function handleChangeColor(tagName: string, color: Color) {
		dispatch(
			setTagColor(story, tagName, color),
			t('undoChange.changeTagColor')
		);
	}

	function handleChangeTagName(tagName: string, newName: string) {
		dispatch(
			renamePassageTag(story, tagName, newName),
			t('undoChange.renameTag')
		);
	}

	return (
		<DialogCard
			className="passage-tags-dialog"
			fixedSize
			headerLabel={t('dialogs.passageTags.title')}
			{...other}
		>
			<CardContent>
				{tags.length > 0 ? (
					tags.map(tag => (
						<TagEditor
							allTags={tags}
							color={story.tagColors[tag]}
							key={tag}
							name={tag}
							onChangeColor={color => handleChangeColor(tag, color)}
							onChangeName={newName => handleChangeTagName(tag, newName)}
						/>
					))
				) : (
					<p>{t('dialogs.passageTags.noTags')}</p>
				)}
			</CardContent>
		</DialogCard>
	);
};

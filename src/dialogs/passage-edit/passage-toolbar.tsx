import {IconResize} from '@tabler/icons';
import {Editor} from 'codemirror';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {UndoRedoButtons} from '../../components/codemirror';
import {ButtonBar} from '../../components/container/button-bar';
import {MenuButton} from '../../components/control/menu-button';
import {RenamePassageButton} from '../../components/passage/rename-passage-button';
import {AddTagButton} from '../../components/tag';
import { TestPassageButton } from '../../routes/story-edit/toolbar/passage/test-passage-button';
import {
	addPassageTag,
	Passage,
	setTagColor,
	Story,
	storyPassageTags,
	updatePassage,
} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Color} from '../../util/color';

export interface PassageToolbarProps {
	disabled?: boolean;
	editor?: Editor;
	passage: Passage;
	story: Story;
}

export const PassageToolbar: React.FC<PassageToolbarProps> = props => {
	const {disabled, editor, passage, story} = props;
	const {dispatch} = useUndoableStoriesContext();
	const {t} = useTranslation();

	function handleAddTag(name: string, color?: Color) {
		// Kind of tricky. We make adding the tag to the passage undoable, but not
		// any color change associated with this. This is because we only set a
		// color here when creating an entirely new tag. If the user is adding an
		// existing tag, then we would only receive the name here, since it's
		// currently impossible to add an existing tag and change its color
		// simultaneously.
		//
		// If this changes, then this should change too.

		dispatch(addPassageTag(story, passage, name), t('undoChange.addTag'));

		if (color) {
			dispatch(setTagColor(story, name, color));
		}
	}

	function handleRename(name: string) {
		// Don't create newly linked passages here because the update action will
		// try to recreate the passage as it's been renamed--it sees new links in
		// existing passages, updates them, but does not see that the passage name
		// has been updated since that hasn't happened yet.

		dispatch(updatePassage(story, passage, {name}, {dontUpdateOthers: true}));
	}

	function handleSetSize({height, width}: {height: number; width: number}) {
		dispatch(updatePassage(story, passage, {height, width}));
	}

	return (
		<ButtonBar>
			<UndoRedoButtons
				disabled={disabled}
				editor={editor}
				watch={passage.text}
			/>
			<AddTagButton
				disabled={disabled}
				assignedTags={passage.tags}
				existingTags={storyPassageTags(story)}
				onAdd={handleAddTag}
			/>
			<MenuButton
				disabled={disabled}
				icon={<IconResize />}
				items={[
					{
						checkable: true,
						checked: passage.height === 100 && passage.width === 100,
						label: t('dialogs.passageEdit.sizeSmall'),
						onClick: () => handleSetSize({height: 100, width: 100})
					},
					{
						checkable: true,
						checked: passage.height === 200 && passage.width === 200,
						label: t('dialogs.passageEdit.sizeLarge'),
						onClick: () => handleSetSize({height: 200, width: 200})
					},
					{
						checkable: true,
						checked: passage.height === 200 && passage.width === 100,
						label: t('dialogs.passageEdit.sizeTall'),
						onClick: () => handleSetSize({height: 200, width: 100})
					},
					{
						checkable: true,
						checked: passage.height === 100 && passage.width === 200,
						label: t('dialogs.passageEdit.sizeWide'),
						onClick: () => handleSetSize({height: 100, width: 200})
					}
				]}
				label={t('dialogs.passageEdit.size')}
			/>
			<RenamePassageButton
				disabled={disabled}
				onRename={handleRename}
				passage={passage}
				story={story}
			/>
			<TestPassageButton passage={passage} story={story} />
		</ButtonBar>
	);
};

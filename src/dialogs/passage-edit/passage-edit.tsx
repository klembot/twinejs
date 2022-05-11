import {IconResize} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {UndoRedoButtons} from '../../components/codemirror/undo-redo-buttons';
import {ButtonBar} from '../../components/container/button-bar';
import {
	DialogCard,
	DialogCardProps
} from '../../components/container/dialog-card';
import {CheckboxButton} from '../../components/control/checkbox-button';
import {MenuButton} from '../../components/control/menu-button';
import {RenamePassageButton} from '../../components/passage/rename-passage-button';
import {AddTagButton, TagButton} from '../../components/tag';
import {
	addPassageTag,
	passageWithId,
	removePassageTag,
	setTagColor,
	storyPassageTags,
	storyWithId,
	updatePassage,
	updateStory
} from '../../store/stories';
import {
	formatWithNameAndVersion,
	useStoryFormatsContext
} from '../../store/story-formats';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Color} from '../../util/color';
import {PassageText} from './passage-text';
import {StoryFormatToolbar} from './story-format-toolbar';
import './passage-edit.css';

export interface PassageEditDialogProps
	extends Omit<DialogCardProps, 'headerLabel'> {
	passageId: string;
	storyId: string;
}

export const InnerPassageEditDialog: React.FC<
	PassageEditDialogProps
> = props => {
	const {passageId, storyId, ...other} = props;
	const [cmEditor, setCmEditor] = React.useState<CodeMirror.Editor>();
	const {dispatch, stories} = useUndoableStoriesContext();
	const {formats} = useStoryFormatsContext();
	const passage = passageWithId(stories, storyId, passageId);
	const story = storyWithId(stories, storyId);
	const storyFormat = formatWithNameAndVersion(
		formats,
		story.storyFormat,
		story.storyFormatVersion
	);
	const {t} = useTranslation();

	const handlePassageTextChange = React.useCallback(
		(text: string) => {
			dispatch(updatePassage(story, passage, {text}));
		},
		[dispatch, passage, story]
	);

	function handleAddTag(name: string, color?: Color) {
		// Kind of tricky. We make adding the tag to the passage undaoble, but not
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

	function handleChangeTagColor(name: string, color: Color) {
		dispatch(
			updateStory(stories, story, {
				tagColors: {...story.tagColors, [name]: color}
			})
		);
	}

	function handleRemoveTag(name: string) {
		dispatch(removePassageTag(story, passage, name), t('undoChange.removeTag'));
	}

	function handleRename(name: string) {
		// Don't create newly linked passages here because the update action will
		// try to recreate the passage as it's been renamed--it sees new links in
		// existing passages, updates them, but does not see that the passage name
		// has been updated since that hasn't happened yet.

		dispatch(
			updatePassage(
				story,
				passage,
				{name},
				{dontCreateNewlyLinkedPassages: true}
			)
		);
	}

	function handleSetAsStart() {
		dispatch(updateStory(stories, story, {startPassage: passageId}));
	}

	function handleSetSize({height, width}: {height: number; width: number}) {
		dispatch(updatePassage(story, passage, {height, width}));
	}

	function handleExecCommand(name: string) {
		// A format toolbar command probably will affect the editor content. It
		// appears that react-codemirror2 can't maintain the selection properly in
		// all cases when this happens (particularly when using
		// `replaceSelection('something', 'around')`), so we take a snapshot
		// immediately after the command runs, let react-codemirror2 work, then
		// reapply the selection ASAP.

		if (!cmEditor) {
			throw new Error('No editor set');
		}

		cmEditor.execCommand(name);

		const selections = cmEditor.listSelections();

		Promise.resolve().then(() => cmEditor.setSelections(selections));
	}

	const isStart = story.startPassage === passage.id;

	return (
		<DialogCard
			{...other}
			className="passage-edit-dialog"
			headerLabel={passage.name}
		>
			<ButtonBar>
				<UndoRedoButtons editor={cmEditor} watch={passage.text} />
				<AddTagButton
					assignedTags={passage.tags}
					existingTags={storyPassageTags(story)}
					onAdd={handleAddTag}
				/>
				<MenuButton
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
					onRename={handleRename}
					passage={passage}
					story={story}
				/>
				<CheckboxButton
					disabled={isStart}
					label={t('dialogs.passageEdit.setAsStart')}
					onChange={handleSetAsStart}
					value={isStart}
				/>
			</ButtonBar>
			<StoryFormatToolbar
				editor={cmEditor}
				onExecCommand={handleExecCommand}
				storyFormat={storyFormat}
			/>
			{passage.tags.length > 0 && (
				<div className="tags">
					<ButtonBar>
						{passage.tags.map(tag => (
							<TagButton
								color={story.tagColors[tag]}
								key={tag}
								name={tag}
								onChangeColor={color => handleChangeTagColor(tag, color)}
								onRemove={() => handleRemoveTag(tag)}
							/>
						))}
					</ButtonBar>
				</div>
			)}
			<PassageText
				onChange={handlePassageTextChange}
				onEditorChange={setCmEditor}
				passage={passage}
				story={story}
				storyFormat={storyFormat}
			/>
		</DialogCard>
	);
};

export const PassageEditDialog: React.FC<PassageEditDialogProps> = props => {
	// Check for the existence of the passage. If it doesn't (e.g. it was deleted
	// after the dialog was opened), render nothing and call onClose.

	const {stories} = useUndoableStoriesContext();

	try {
		passageWithId(stories, props.storyId, props.passageId);
	} catch (err) {
		props.onClose();
		return null;
	}

	return <InnerPassageEditDialog {...props} />;
};

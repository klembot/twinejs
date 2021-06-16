import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {UndoRedoButtons} from '../../components/codemirror/undo-redo-buttons';
import {ButtonBar} from '../../components/container/button-bar';
import {
	DialogCard,
	DialogCardProps
} from '../../components/container/dialog-card';
import {CheckboxButton} from '../../components/control/checkbox-button';
import {AddTagButton, TagButton} from '../../components/tag';
import {
	addPassageTag,
	passageWithId,
	removePassageTag,
	renamePassageTag,
	setTagColor,
	storyWithId,
	updatePassage,
	updateStory
} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Color} from '../../util/color';
import {PassageText} from './passage-text';
import {RenamePassageButton} from '../../components/passage/rename-passage-button';
import './passage-edit.css';

export interface PassageEditDialogProps
	extends Omit<DialogCardProps, 'headerLabel'> {
	passageId: string;
	storyId: string;
}

export const PassageEditDialog: React.FC<PassageEditDialogProps> = props => {
	const {passageId, storyId, ...other} = props;
	const [cmEditor, setCmEditor] = React.useState<CodeMirror.Editor>();
	const {dispatch, stories} = useUndoableStoriesContext();
	const passage = passageWithId(stories, storyId, passageId);
	const story = storyWithId(stories, storyId);
	const {t} = useTranslation();

	// TODO: make tag changes undoable

	function handleAddTag(name: string, color: Color) {
		dispatch(addPassageTag(story, passage, name));
		dispatch(setTagColor(story, name, color));
	}

	function handleDeleteTag(name: string) {
		dispatch(removePassageTag(story, passage, name));
	}

	function handleEditTag(oldName: string, newName: string, newColor: Color) {
		dispatch(renamePassageTag(story, oldName, newName));
		dispatch(setTagColor(story, newName, newColor));
	}

	function handleRename(name: string) {
		dispatch(updatePassage(story, passage, {name}));
	}

	function handlePassageTextChange(text: string) {
		dispatch(updatePassage(story, passage!, {text}));
	}

	function handleSetAsStart() {
		dispatch(updateStory(stories, story, {startPassage: passageId}));
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
				<AddTagButton onCreate={handleAddTag} />
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
			{passage.tags.length > 0 && (
				<div className="tags">
					<ButtonBar>
						{passage.tags.map(tag => (
							<TagButton
								color={story.tagColors[tag]}
								key={tag}
								name={tag}
								onDelete={() => handleDeleteTag(tag)}
								onEdit={(newName, newColor) =>
									handleEditTag(tag, newName, newColor)
								}
							/>
						))}
					</ButtonBar>
				</div>
			)}
			<PassageText
				onChange={handlePassageTextChange}
				onEditorChange={setCmEditor}
				passage={passage}
			/>
		</DialogCard>
	);
};

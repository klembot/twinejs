import * as React from 'react';
import {useTranslation} from 'react-i18next';
import useErrorBoundary from 'use-error-boundary';
import {
	DialogCard,
	DialogCardProps
} from '../../components/container/dialog-card';
import {ErrorMessage} from '../../components/error';
import {passageWithId, storyWithId, updatePassage} from '../../store/stories';
import {
	formatWithNameAndVersion,
	useStoryFormatsContext
} from '../../store/story-formats';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import './passage-edit.css';
import {PassageText} from './passage-text';
import {PassageToolbar} from './passage-toolbar';
import {StoryFormatToolbar} from './story-format-toolbar';
import {TagToolbar} from './tag-toolbar';

export interface PassageEditDialogProps
	extends Omit<DialogCardProps, 'headerLabel'> {
	passageId: string;
	storyId: string;
}

export const InnerPassageEditDialog: React.FC<
	PassageEditDialogProps
> = props => {
	const {passageId, storyId, ...other} = props;
	const [storyFormatExtensionsEnabled, setStoryFormatExtensionsEnabled] =
		React.useState(true);
	const [editorCrashed, setEditorCrashed] = React.useState(false);
	const [cmEditor, setCmEditor] = React.useState<CodeMirror.Editor>();
	const {ErrorBoundary, error, reset: resetError} = useErrorBoundary();
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

	React.useEffect(() => {
		if (error) {
			if (storyFormatExtensionsEnabled) {
				console.error(
					'Passage editor crashed, trying without format extensions',
					error
				);
				setStoryFormatExtensionsEnabled(false);
			} else {
				setEditorCrashed(true);
			}

			resetError();
		}
	}, [error, resetError, storyFormatExtensionsEnabled]);

	const handlePassageTextChange = React.useCallback(
		(text: string) => {
			dispatch(updatePassage(story, passage, {text}));
		},
		[dispatch, passage, story]
	);

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

	return (
		<DialogCard
			{...other}
			className="passage-edit-dialog"
			headerLabel={passage.name}
			maximizable
		>
			{editorCrashed ? (
				<ErrorMessage>{t('dialogs.passageEdit.editorCrashed')}</ErrorMessage>
			) : (
				<>
					<PassageToolbar editor={cmEditor} passage={passage} story={story} />
					{storyFormatExtensionsEnabled && (
						<StoryFormatToolbar
							editor={cmEditor}
							onExecCommand={handleExecCommand}
							storyFormat={storyFormat}
						/>
					)}
					<TagToolbar passage={passage} story={story} />
					<ErrorBoundary>
						<PassageText
							onChange={handlePassageTextChange}
							onEditorChange={setCmEditor}
							passage={passage}
							story={story}
							storyFormat={storyFormat}
							storyFormatExtensionsDisabled={!storyFormatExtensionsEnabled}
						/>
					</ErrorBoundary>
				</>
			)}
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

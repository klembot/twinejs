import * as React from 'react';
import {useTranslation} from 'react-i18next';
import useErrorBoundary from 'use-error-boundary';
import {ErrorMessage} from '../../components/error';
import {passageWithId, storyWithId, updatePassage} from '../../store/stories';
import {
	formatWithNameAndVersion,
	useStoryFormatsContext
} from '../../store/story-formats';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {PassageText} from './passage-text';
import {PassageToolbar} from './passage-toolbar';
import {StoryFormatToolbar} from './story-format-toolbar';
import './passage-edit-contents.css';
import {usePrefsContext} from '../../store/prefs';

export interface PassageEditContentsProps {
	disabled?: boolean;
	passageId: string;
	storyId: string;
}

export const PassageEditContents: React.FC<
	PassageEditContentsProps
> = props => {
	const {disabled, passageId, storyId} = props;
	const [storyFormatExtensionsEnabled, setStoryFormatExtensionsEnabled] =
		React.useState(true);
	const [editorCrashed, setEditorCrashed] = React.useState(false);
	const [cmEditor, setCmEditor] = React.useState<CodeMirror.Editor>();
	const {ErrorBoundary, error, reset: resetError} = useErrorBoundary();
	const {prefs} = usePrefsContext();
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

	if (editorCrashed) {
		return (
			<ErrorMessage>{t('dialogs.passageEdit.editorCrashed')}</ErrorMessage>
		);
	}

	return (
		<div className="passage-edit-contents" aria-hidden={disabled}>
			<PassageToolbar
				disabled={disabled}
				editor={cmEditor}
				passage={passage}
				story={story}
				useCodeMirror={prefs.useCodeMirror}
			/>
			{prefs.useCodeMirror && storyFormatExtensionsEnabled && (
				<StoryFormatToolbar
					disabled={disabled}
					editor={cmEditor}
					onExecCommand={handleExecCommand}
					storyFormat={storyFormat}
				/>
			)}
			<ErrorBoundary>
				<PassageText
					disabled={disabled}
					onChange={handlePassageTextChange}
					onEditorChange={setCmEditor}
					passage={passage}
					story={story}
					storyFormat={storyFormat}
					storyFormatExtensionsDisabled={!storyFormatExtensionsEnabled}
				/>
			</ErrorBoundary>
		</div>
	);
};

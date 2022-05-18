import {debounce} from 'lodash';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {DialogEditor} from '../../components/container/dialog-card';
import {CodeArea} from '../../components/control/code-area';
import {usePrefsContext} from '../../store/prefs';
import {Passage, Story} from '../../store/stories';
import {StoryFormat} from '../../store/story-formats';
import {useCodeMirrorPassageHints} from '../../store/use-codemirror-passage-hints';
import {useFormatCodeMirrorMode} from '../../store/use-format-codemirror-mode';
import {codeMirrorOptionsFromPrefs} from '../../util/codemirror-options';

export interface PassageTextProps {
	onChange: (value: string) => void;
	onEditorChange: (value: CodeMirror.Editor) => void;
	passage: Passage;
	story: Story;
	storyFormat: StoryFormat;
	storyFormatExtensionsDisabled?: boolean;
}

export const PassageText: React.FC<PassageTextProps> = props => {
	const {
		onChange,
		onEditorChange,
		passage,
		story,
		storyFormat,
		storyFormatExtensionsDisabled
	} = props;
	const [changePending, setChangePending] = React.useState(false);
	const [localText, setLocalText] = React.useState(passage.text);
	const {prefs} = usePrefsContext();
	const autocompletePassageNames = useCodeMirrorPassageHints(story);
	const mode =
		useFormatCodeMirrorMode(storyFormat.name, storyFormat.version) ?? 'text';
	const {t} = useTranslation();

	// Effects to handle debouncing updates upward. The idea here is that the
	// component maintains a local state so that the CodeMirror instance always is
	// up-to-date with what the user has typed, but the global context may not be.
	// This is because updating global context causes re-rendering in the story
	// map, which can be time-intensive.

	React.useEffect(() => {
		// A change to passage text has occurred externally, e.g. through a find and
		// replace. We ignore this if a change is pending so that users don't see
		// things they've typed in disappear or be replaced.

		if (!changePending && localText !== passage.text) {
			setLocalText(passage.text);
		}
	}, [changePending, localText, passage.text]);

	// The code below handles user changes in the text field. 1 second is a
	// guesstimate.

	const debouncedOnChange = React.useMemo(
		() =>
			debounce((value: string) => {
				onChange(value);
				setChangePending(false);
			}, 1000),
		[onChange]
	);

	const handleMount = React.useCallback(
		(editor: CodeMirror.Editor) => {
			onEditorChange(editor);

			// The potential combination of loading a mode and the dialog entrance
			// animation seems to mess up CodeMirror's cursor rendering. The delay below
			// is intended to run after the animation completes.

			window.setTimeout(() => {
				editor.focus();
				editor.refresh();
			}, 400);
		},
		[onEditorChange]
	);

	const handleChange = React.useCallback(
		(
			editor: CodeMirror.Editor,
			data: CodeMirror.EditorChange,
			text: string
		) => {
			onEditorChange(editor);
			setChangePending(true);
			debouncedOnChange(text);
			setLocalText(text);
		},
		[debouncedOnChange, onEditorChange]
	);

	const options = React.useMemo(
		() => ({
			...codeMirrorOptionsFromPrefs(prefs),
			mode: storyFormatExtensionsDisabled ? 'text' : mode,
			lineWrapping: true,
			placeholder: t('dialogs.passageEdit.passageTextPlaceholder'),
			prefixTrigger: {
				callback: autocompletePassageNames,
				prefixes: ['[[', '->']
			}
		}),
		[autocompletePassageNames, mode, prefs, storyFormatExtensionsDisabled, t]
	);

	return (
		<DialogEditor>
			<CodeArea
				editorDidMount={handleMount}
				fontFamily={prefs.passageEditorFontFamily}
				fontScale={prefs.passageEditorFontScale}
				label={t('dialogs.passageEdit.passageTextEditorLabel')}
				labelHidden
				onBeforeChange={handleChange}
				onChange={onEditorChange}
				options={options}
				value={localText}
			/>
		</DialogEditor>
	);
};

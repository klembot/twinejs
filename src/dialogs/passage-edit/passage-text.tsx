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
	const [localText, setLocalText] = React.useState(passage.text);
	const {prefs} = usePrefsContext();
	const autocompletePassageNames = useCodeMirrorPassageHints(story);
	const mode =
		useFormatCodeMirrorMode(storyFormat.name, storyFormat.version) ?? 'text';
	const {t} = useTranslation();

	// These are refs so that changing them doesn't trigger a rerender, and more
	// importantly, no React effects fire.

	const onChangeText = React.useRef<string>();
	const onChangeTimeout = React.useRef<number>();

	// Effects to handle debouncing updates upward. The idea here is that the
	// component maintains a local state so that the CodeMirror instance always is
	// up-to-date with what the user has typed, but the global context may not be.
	// This is because updating global context causes re-rendering in the story
	// map, which can be time-intensive.

	React.useEffect(() => {
		// A change to passage text has occurred externally, e.g. through a find and
		// replace. We ignore this if a change is pending so that users don't see
		// things they've typed in disappear or be replaced.

		if (!onChangeTimeout.current && localText !== passage.text) {
			setLocalText(passage.text);
		}
	}, [localText, passage.text]);

	const handleLocalChange = React.useCallback(
		(
			editor: CodeMirror.Editor,
			data: CodeMirror.EditorChange,
			text: string
		) => {
			// A local change has been made, e.g. the user has typed or pasted into
			// the field. It's safe to immediately trigger a CodeMirror editor update.

			onEditorChange(editor);

			// Set local state because the CodeMirror instance is controlled, and
			// updates there should be immediate.

			setLocalText(text);

			// If there was a pending update, cancel it.

			if (onChangeTimeout.current) {
				window.clearTimeout(onChangeTimeout.current);
			}

			// Save the text value in case we need to reset the timeout in the next
			// effect.

			onChangeText.current = text;

			// Queue a call to onChange.

			onChangeTimeout.current = window.setTimeout(() => {
				// Important to reset this ref so that we don't try to cancel fired
				// timeouts above.

				onChangeTimeout.current = undefined;

				// Finally call the onChange prop.

				onChange(onChangeText.current!);
			}, 1000);
		},
		[onChange, onEditorChange]
	);

	// If the onChange prop changes while an onChange call is pending, reset the
	// timeout and point it to the correct callback.

	React.useEffect(() => {
		if (onChangeTimeout.current) {
			window.clearTimeout(onChangeTimeout.current);
			onChangeTimeout.current = window.setTimeout(() => {
				// This body must be the same as in the timeout in the previous effect.

				onChangeTimeout.current = undefined;
				onChange(onChangeText.current!);
			}, 1000);
		}
	}, [onChange]);

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
				onBeforeChange={handleLocalChange}
				onChange={onEditorChange}
				options={options}
				value={localText}
			/>
		</DialogEditor>
	);
};
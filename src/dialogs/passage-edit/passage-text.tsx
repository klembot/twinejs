import * as React from 'react';
import {DialogEditor} from '../../components/container/dialog-card';
import {CodeArea} from '../../components/control/code-area';
import {usePrefsContext} from '../../store/prefs';
import {Passage} from '../../store/stories';

export interface PassageTextProps {
	onChange: (value: string) => void;
	onEditorChange: (value: CodeMirror.Editor) => void;
	passage: Passage;
}

export const PassageText: React.FC<PassageTextProps> = props => {
	const {onChange, onEditorChange, passage} = props;
	const {prefs} = usePrefsContext();

	function handleChange(
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) {
		onEditorChange(editor);
		onChange(text);
	}

	return (
		<DialogEditor>
			<CodeArea
				editorDidMount={onEditorChange}
				fontFamily={prefs.passageEditorFontFamily}
				fontScale={prefs.passageEditorFontScale}
				onBeforeChange={handleChange}
				onChange={onEditorChange}
				options={{autofocus: true, lineWrapping: true, mode: 'text'}}
				value={passage.text}
			/>
		</DialogEditor>
	);
};

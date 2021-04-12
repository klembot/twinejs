import * as React from 'react';
import {DialogEditor} from '../../../../components/container/dialog-card';
import {CodeArea} from '../../../../components/control/code-area';
import {usePrefsContext} from '../../../../store/prefs';
import {Passage} from '../../../../store/stories';

export interface PassageTextProps {
	onChange: (value: string) => void;
	passage: Passage;
}

export const PassageText: React.FC<PassageTextProps> = props => {
	const {onChange, passage} = props;
	const {prefs} = usePrefsContext();

	return (
		<DialogEditor>
			<CodeArea
				fontFamily={prefs.passageEditorFontFamily}
				fontScale={prefs.passageEditorFontScale}
				onBeforeChange={(editor, data, text) => onChange(text)}
				options={{autofocus: true, lineWrapping: true, mode: 'text'}}
				value={passage.text}
			/>
		</DialogEditor>
	);
};

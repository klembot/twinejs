import * as React from 'react';
import {CodeArea} from '../../../../components/control/code-area';
import {usePrefsContext} from '../../../../store/prefs';
import {Passage} from '../../../../store/stories';
import './passage-text.css';

export interface PassageTextProps {
	onChange: (value: string) => void;
	passage: Passage;
}

export const PassageText: React.FC<PassageTextProps> = props => {
	const {onChange, passage} = props;
	const {prefs} = usePrefsContext();

	return (
		<div className="passage-text">
			<CodeArea
				fontFamily={prefs.passageEditorFontFamily}
				fontScale={prefs.passageEditorFontScale}
				onBeforeChange={(editor, data, text) => onChange(text)}
				options={{autofocus: true, mode: 'text'}}
				value={passage.text}
			/>
		</div>
	);
};

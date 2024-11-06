import * as React from 'react';
import {CodeAreaProps} from '../code-area';

export const CodeArea: React.FC<CodeAreaProps> = props => {
	function handleOnChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
		props.onChangeEditor?.({
			historySize: () => ({
				redo: 0,
				undo: 0
			}),
			mockCodeMirrorEditor: true
		} as any);
		props.onChangeText(e.target.value);
	}

	return (
		<div
			data-testid="mock-code-area"
			data-font-family={props.fontFamily}
			data-font-scale={props.fontScale}
			data-options={JSON.stringify(props.options)}
			data-use-code-mirror={props.useCodeMirror}
		>
			<label>
				{props.label} <textarea onChange={handleOnChange} value={props.value} />
			</label>
		</div>
	);
};

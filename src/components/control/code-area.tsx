import * as React from 'react';
import {
	Controlled as CodeMirror,
	IControlledCodeMirror
} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import './code-area.css';

// TODO: rework syntax highlights

export interface CodeAreaProps extends IControlledCodeMirror {
	fontFamily?: string;
	fontScale?: number;
	label?: string;
	value: string;
}

export const CodeArea: React.FC<CodeAreaProps> = props => {
	const {fontFamily, fontScale, label, ...otherProps} = props;
	const style: React.CSSProperties = {};

	if (fontFamily) {
		style.fontFamily = fontFamily.includes(' ')
			? `"${fontFamily}"`
			: fontFamily;
	}

	if (fontScale) {
		style.fontSize =
			fontScale === -1 ? 'calc(100% + 1vw)' : `${fontScale * 100}%`;
	}

	return (
		<div className="code-area" style={style}>
			{label ? (
				<label>
					<span className="label">{label}</span>
					<CodeMirror {...otherProps} />
				</label>
			) : (
				<CodeMirror {...otherProps} />
			)}
		</div>
	);
};

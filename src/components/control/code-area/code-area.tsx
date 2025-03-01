import * as React from 'react';
import {
	Controlled as CodeMirror,
	IControlledCodeMirror
} from 'react-codemirror2';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import './code-area.css';
import './codemirror-theme.css';
import classnames from 'classnames';
import {initPrefixTriggerGlobally} from '../../../codemirror/prefix-trigger';

// Not ideal by far to do this init here, outside of a component, but we have to
// set up CodeMirror before the first render. Otherwise, CodeMirror doesn't pick
// up on options properly.

initPrefixTriggerGlobally();

export interface CodeAreaProps extends Omit<IControlledCodeMirror, 'onBeforeChange'> {
	fontFamily?: string;
	fontScale?: number;
	// ID is required because nesting the input inside the label causes screen
	// readers to announce the label on every input, which is very annoying.
	id: string;
	label: string;
	labelHidden?: boolean;
	onChangeEditor?: (value: CodeMirror.Editor) => void;
	onChangeText: (value: string, data?: CodeMirror.EditorChange) => void;
	useCodeMirror?: boolean;
	value: string;
}

export const CodeArea: React.FC<CodeAreaProps> = props => {
	const {
		fontFamily,
		fontScale,
		id,
		label,
		onChangeEditor,
		onChangeText,
		useCodeMirror,
		...otherProps
	} = props;
	const containerRef = React.useRef<HTMLDivElement>(null);
	const style: React.CSSProperties = {};

	if (fontFamily) {
		style.fontFamily = fontFamily.includes(' ')
			? `"${fontFamily}"`
			: fontFamily;
	}

	if (fontScale) {
		style.fontSize = `${fontScale * 100}%`;
	}

	function handleCodeMirrorBeforeChange(
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) {
		onChangeEditor?.(editor);
		onChangeText(text, data);
	}

	// We need to set the ID of the underlying <textarea> ourselves if we're using
	// CodeMirror.

	React.useEffect(() => {
		if (useCodeMirror && containerRef.current) {
			const textarea = containerRef.current.querySelector('textarea');

			if (textarea) {
				textarea.setAttribute('id', id);
			}
		}
	}, [id, useCodeMirror]);

	return (
		<div className="code-area" ref={containerRef} style={style}>
			<label
				htmlFor={id}
				className={classnames('label', {
					'screen-reader-only': props.labelHidden
				})}
			>
				{label}
			</label>
			{useCodeMirror ? (
				<CodeMirror
					{...otherProps}
					onBeforeChange={handleCodeMirrorBeforeChange}
				/>
			) : (
				<textarea
					className="visible"
					id={id}
					onChange={({target}) => onChangeText(target.value)}
					placeholder={otherProps.options?.placeholder}
					style={style}
				>
					{otherProps.value}
				</textarea>
			)}
		</div>
	);
};

import * as React from 'react';
import './dialog-editor.css';

export type DialogEditorProps = React.ComponentPropsWithoutRef<'div'>;

export const DialogEditor = React.forwardRef<HTMLDivElement, DialogEditorProps>(
	(props, ref) => (
		<div className="dialog-editor" ref={ref}>
			{props.children}
		</div>
	)
);

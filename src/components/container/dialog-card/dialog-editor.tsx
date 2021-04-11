import * as React from 'react';
import './dialog-editor.css';

export const DialogEditor: React.FC = props => (
	<div className="dialog-editor">{props.children}</div>
);

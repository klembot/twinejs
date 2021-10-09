import * as React from 'react';
import {CodeAreaProps} from '../code-area';

export const CodeArea: React.FC<CodeAreaProps> = props => (
	<label>
		{props.label} <textarea onChange={jest.fn()} value={props.value} />
	</label>
);

import * as React from 'react';
import {PassageTextProps} from '../passage-text';

export const PassageText: React.FC<PassageTextProps> = props => (
	<div data-testid={`mock-passage-text-${props.passage.id}`}>
		<button onClick={() => props.onChange('mock-changed-text')}>
			onChange
		</button>
	</div>
);

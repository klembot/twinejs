import * as React from 'react';
import {AddTagButtonProps} from '../add-tag-button';

export const AddTagButton: React.FC<AddTagButtonProps> = ({onAdd}) => (
	<div data-testid="mock-add-tag-button">
		<button onClick={() => onAdd('mock-tag-name', 'mock-color')}>onAdd</button>
	</div>
);

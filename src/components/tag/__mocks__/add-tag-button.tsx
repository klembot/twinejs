import * as React from 'react';
import {AddTagButtonProps} from '../add-tag-button';

export const AddTagButton: React.FC<AddTagButtonProps> = ({
	disabled,
	onAdd
}) => (
	<div data-testid="mock-add-tag-button">
		<button
			disabled={disabled}
			onClick={() => onAdd('mock-tag-name', 'mock-color')}
		>
			onAdd
		</button>
	</div>
);

import * as React from 'react';
import {TagButtonProps} from '../tag-button';

export const TagButton: React.FC<TagButtonProps> = ({
	disabled,
	name,
	onChangeColor,
	onRemove
}) => (
	<div data-testid={`mock-tag-button-${name}`} data-disabled={disabled}>
		<button onClick={() => onChangeColor('mock-color')}>onChangeColor</button>
		<button onClick={onRemove}>onRemove</button>
	</div>
);

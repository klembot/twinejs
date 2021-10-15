import * as React from 'react';
import {TagButtonProps} from '../tag-button';

export const TagButton: React.FC<TagButtonProps> = ({
	name,
	onChangeColor,
	onRemove
}) => (
	<div data-testid={`mock-tag-button-${name}`}>
		<button onClick={() => onChangeColor('mock-color')}>onChangeColor</button>
		<button onClick={onRemove}>onRemove</button>
	</div>
);

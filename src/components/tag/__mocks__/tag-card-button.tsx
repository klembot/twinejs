import * as React from 'react';
import {TagCardButtonProps} from '../tag-card-button';

export const TagCardButton: React.FC<TagCardButtonProps> = props => (
	<div data-testid="mock-tag-card-button">
		<button disabled={props.disabled} onClick={() => props.onAdd('mock-tag-name')}>
			onAdd
		</button>
		<button disabled={props.disabled} onClick={() => props.onChangeColor('mock-tag-name', 'mock-changed-color')}>
			onChangeColor
		</button>
		<button disabled={props.disabled} onClick={() => props.onRemove('mock-tag-name')}>
			onRemove
		</button>
	</div>
);

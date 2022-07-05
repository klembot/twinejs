import * as React from 'react';
import {PassageTextProps} from '../passage-text';

export const PassageText: React.FC<PassageTextProps> = props => {
	const [error, setError] = React.useState(false);

	if (error) {
		throw new Error();
	}

	return (
		<div
			data-testid={`mock-passage-text-${props.passage.id}`}
			data-story-format-extensions-disabled={
				props.storyFormatExtensionsDisabled
			}
		>
			<button onClick={() => props.onChange('mock-changed-text')}>
				onChange
			</button>
			<button onClick={() => setError(true)}>throw error</button>
		</div>
	);
};

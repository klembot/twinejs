import * as React from 'react';
import {formatWithId, useStoryFormatsContext} from '../store/story-formats';

export interface StoryFormatInspectorProps {
	id?: string;
}

export const StoryFormatInspector: React.FC<StoryFormatInspectorProps> = ({
	id
}) => {
	const {formats} = useStoryFormatsContext();
	const format = id ? formatWithId(formats, id) : formats[0];

	if (format) {
		return (
			<div
				hidden
				data-testid={`story-format-inspector-${id ?? 'default'}`}
				data-id={format.id}
				data-name={format.name}
				data-version={format.version}
			/>
		);
	}

	return null;
};

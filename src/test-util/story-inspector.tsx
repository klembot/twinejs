import * as React from 'react';
import {storyWithId, useStoriesContext} from '../store/stories';

export interface StoryInspectorProps {
	id?: string;
}

export const StoryInspector: React.FC<StoryInspectorProps> = ({id}) => {
	const {stories} = useStoriesContext();
	const story = id ? storyWithId(stories, id) : stories[0];

	if (story) {
		return (
			<div
				hidden
				data-testid={`story-inspector-${id ?? 'default'}`}
				data-id={story.id}
				data-name={story.name}
				data-story-format={story.storyFormat}
				data-story-format-version={story.storyFormatVersion}
				data-zoom={story.zoom}
			>
				{story.passages.map(passage => (
					<div
						key={passage.id}
						data-testid={`passage-${passage.id}`}
						data-left={passage.left}
						data-name={passage.name}
						data-selected={passage.selected}
						data-top={passage.top}
					>
						{passage.text}
					</div>
				))}
			</div>
		);
	}

	return null;
};

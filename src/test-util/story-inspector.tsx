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
				data-snap-to-grid={story.snapToGrid}
				data-start-passage={story.startPassage}
				data-story-format={story.storyFormat}
				data-story-format-version={story.storyFormatVersion}
				data-tags={story.tags.join(' ')}
				data-tag-colors={JSON.stringify(story.tagColors)}
				data-zoom={story.zoom}
			>
				<div data-testid={`story-inspector-javascript-${id ?? 'default'}`}>
					{story.script}
				</div>
				<div data-testid={`story-inspector-stylesheet-${id ?? 'default'}`}>
					{story.stylesheet}
				</div>
				{story.passages.map(passage => (
					<div
						key={passage.id}
						data-height={passage.height}
						data-highlighted={passage.highlighted}
						data-id={passage.id}
						data-testid={`passage-${passage.id}`}
						data-left={passage.left}
						data-name={passage.name}
						data-selected={passage.selected}
						data-tags={passage.tags.join(' ')}
						data-top={passage.top}
						data-width={passage.width}
					>
						{passage.text}
					</div>
				))}
			</div>
		);
	}

	return null;
};

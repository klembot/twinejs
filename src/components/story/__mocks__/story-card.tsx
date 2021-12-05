import * as React from 'react';
import {StoryCardProps} from '../story-card';

export const StoryCard: React.FC<StoryCardProps> = props => (
	<div data-testid={`mock-story-card-${props.story.id}`}>
		<button onClick={() => props.onAddTag('mock-tag', 'mock-tag-color')}>
			onAddTag
		</button>
		<button
			onClick={() => props.onChangeTagColor('mock-tag', 'mock-tag-color')}
		>
			onChangeTagColor
		</button>
		<button onClick={props.onDelete}>onDelete</button>
		<button onClick={props.onDuplicate}>onDuplicate</button>
		<button onClick={props.onEdit}>onEdit</button>
		<button onClick={props.onPlay}>onPlay</button>
		<button onClick={props.onPublish}>onPublish</button>
		<button onClick={() => props.onRemoveTag('mock-tag')}>onRemoveTag</button>
		<button onClick={() => props.onRename('mock-name')}>onRename</button>
		<button onClick={props.onTest}>onTest</button>
	</div>
);

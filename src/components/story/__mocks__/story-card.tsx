import * as React from 'react';
import {StoryCardProps} from '../story-card';

export const StoryCard: React.FC<StoryCardProps> = props => (
	<div data-testid={`mock-story-card-${props.story.id}`}>
		<button
			onClick={() => props.onChangeTagColor('mock-tag', 'mock-tag-color')}
		>
			onChangeTagColor
		</button>
		<button onClick={props.onEdit}>onEdit</button>
		<button onClick={() => props.onRemoveTag('mock-tag')}>onRemoveTag</button>
	</div>
);

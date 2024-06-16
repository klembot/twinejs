import * as React from 'react';
import {StoryCardsProps} from '../story-cards';

export const StoryCards = ({stories}: StoryCardsProps) => (
	<div data-testid="mock-story-cards">
		{stories.map(story => (
			<div data-testid="mock-story-card" data-id={story.id} key={story.id} />
		))}
	</div>
);

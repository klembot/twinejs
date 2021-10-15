import * as React from 'react';
import {StoryPreviewProps} from '../story-preview';

export const StoryPreview: React.FC<StoryPreviewProps> = ({story}) => (
	<div data-testid={`mock-story-preview-${story.name}`} />
);

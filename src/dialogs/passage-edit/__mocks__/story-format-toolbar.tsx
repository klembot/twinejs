import * as React from 'react';
import {StoryFormatToolbarProps} from '../story-format-toolbar';

export const StoryFormatToolbar: React.FC<StoryFormatToolbarProps> = ({
	storyFormat
}) => <div data-testid={`mock-story-format-toolbar-${storyFormat.id}`} />;

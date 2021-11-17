import * as React from 'react';
import {StoryInfoDialogStatsProps} from '../story-stats';

export const StoryInfoDialogStats: React.FC<StoryInfoDialogStatsProps> = ({
	story
}) => <div data-testid={`mock-story-info-dialog-stats-${story.id}`} />;

import * as React from 'react';
import {StoryDetailsDialogStatsProps} from '../story-stats';

export const StoryDetailsDialogStats: React.FC<StoryDetailsDialogStatsProps> = ({
	story
}) => <div data-testid={`mock-story-details-dialog-stats-${story.id}`} />;

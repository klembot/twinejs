import * as React from 'react';
import {StoryChooserProps} from '../story-chooser';

export const StoryChooser: React.FC<StoryChooserProps> = ({
	onImport,
	stories
}) => (
	<div data-testid="mock-story-chooser">
		<ul>
			{stories.map(story => (
				<li key={story.name}>{story.name}</li>
			))}
		</ul>
		<button onClick={() => onImport(stories)}>onImport</button>
	</div>
);

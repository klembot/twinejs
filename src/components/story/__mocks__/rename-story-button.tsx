import * as React from 'react';
import {RenameStoryButtonProps} from '../rename-story-button';

export const RenameStoryButton: React.FC<RenameStoryButtonProps> = ({
	onRename,
	story
}) => (
	<button onClick={() => onRename('mock-new-name')}>
		mock-rename-story-button-{story?.id}
	</button>
);

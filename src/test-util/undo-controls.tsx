import * as React from 'react';
import {updateStory} from '../store/stories';
import {useUndoableStoriesContext} from '../store/undoable-stories';

export const UndoControls: React.FC = () => {
	const {dispatch, stories} = useUndoableStoriesContext();
	const [annotation, setAnnotation] = React.useState('mock-annotation');

	function handleCreateUndo() {
		dispatch(
			updateStory(stories, stories[0], {name: 'mock-story-rename'}),
			annotation
		);
	}

	return (
		<div hidden data-testid="undo-controls">
			<input
				type="text"
				onChange={e => setAnnotation(e.target.value)}
				value={annotation}
			/>
			<button onClick={handleCreateUndo}>undo-controls-create-undo</button>
		</div>
	);
};

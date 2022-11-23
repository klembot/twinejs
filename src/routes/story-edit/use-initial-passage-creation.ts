import * as React from 'react';
import {createUntitledPassage, Story} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Point} from '../../util/geometry';

export function useInitialPassageCreation(
	story: Story,
	getCenter: () => Point
) {
	const {dispatch} = useUndoableStoriesContext();
	const [inited, setInited] = React.useState(false);

	// If we have just mounted and the story has no passages, create one for the
	// user (and skip undo history, since it was an automatic action).

	React.useEffect(() => {
		if (!inited) {
			setInited(true);

			if (story.passages.length === 0) {
				const center = getCenter();

				dispatch(createUntitledPassage(story, center.left, center.top));
			}
		}
	}, [dispatch, getCenter, inited, story]);
}

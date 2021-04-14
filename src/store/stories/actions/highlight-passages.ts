import {StoriesDispatch, Story, StorySearchFlags} from '../stories.types';
import {passagesMatchingSearch} from '../getters';

export function highlightPassagesMatchingSearch(
	dispatch: StoriesDispatch,
	story: Story,
	search: string,
	flags: StorySearchFlags
) {
	const matchIds = passagesMatchingSearch(story.passages, search, flags).map(
		passage => passage.id
	);

	story.passages.forEach(passage => {
		const oldHighlighted = passage.highlighted;
		const newHighlighted = matchIds.includes(passage.id);

		if (newHighlighted !== oldHighlighted) {
			dispatch({
				type: 'updatePassage',
				passageId: passage.id,
				props: {highlighted: newHighlighted},
				storyId: story.id
			});
		}
	});
}

import escapeRegExp from 'lodash/escapeRegExp';
import {StoriesDispatch, Story} from '../stories.types';

export function highlightPassagesWithText(
	dispatch: StoriesDispatch,
	story: Story,
	search: string
) {
	// Special case empty string to match nothing.

	const matcher = new RegExp(
		search === '' ? '^$' : escapeRegExp(search),
		'i'
	);

	story.passages.forEach(passage => {
		const oldHighlighted = passage.highlighted;
		const newHighlighted =
			matcher.test(passage.name) || matcher.test(passage.text);

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

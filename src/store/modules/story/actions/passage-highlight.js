import escapeRegexp from 'lodash.escaperegexp';

export function highlightPassagesWithText(
	{commit, getters},
	{search, storyId}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	/* Special case empty string to match nothing. */

	const matcher = new RegExp(search === '' ? '^$' : escapeRegexp(search), 'i');

	story.passages.forEach(p => {
		const oldHighlighted = p.highlighted;
		const newHighlighted = matcher.test(p.name) || matcher.test(p.text);

		if (newHighlighted !== oldHighlighted) {
			commit('updatePassage', {
				storyId,
				passageId: p.id,
				passageProps: {highlighted: newHighlighted}
			});
		}
	});
}

import isFinite from 'lodash.isfinite';

export function moveSelectedPassages(
	{commit, getters},
	{xChange, yChange, storyId}
) {
	if (!isFinite(xChange)) {
		throw new Error(
			`${xChange} is not a valid offset to move passages horizontally.`
		);
	}

	if (!isFinite(yChange)) {
		throw new Error(
			`${yChange} is not a valid offset to move passages vertically.`
		);
	}

	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	story.passages.forEach(p => {
		if (p.selected) {
			// TODO: clean up overlaps

			let left = p.left + xChange;
			let top = p.top + yChange;

			if (story.snapToGrid) {
				left = Math.round(left / 25) * 25;
				top = Math.round(top / 25) * 25;
			}

			commit('updatePassage', {
				storyId,
				passageId: p.id,
				passageProps: {left, top}
			});
		}
	});
}

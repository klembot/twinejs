import isFinite from 'lodash.isfinite';

export function movePassages(
	{commit, getters},
	{xChange, yChange, passageIds, storyId}
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

	passageIds.forEach(id => {
		const passage = story.passages.find(p => p.id === id);

		if (!id) {
			throw new Error(`There is no passage in this story with ID "${id}".`);
		}

		// TODO: clean up overlaps

		let left = passage.left + xChange;
		let top = passage.top + yChange;

		if (story.snapToGrid) {
			left = Math.round(left / 25) * 25;
			top = Math.round(top / 25) * 25;
		}

		commit('updatePassage', {
			storyId,
			passageId: passage.id,
			passageProps: {left, top}
		});
	});
}

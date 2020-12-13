export function renameTag(
	{commit, getters},
	{newTagName, oldTagName, storyId}
) {
	[newTagName, oldTagName].forEach(tagName => {
		if (typeof tagName !== 'string') {
			throw new Error('Tag names must be strings.');
		}

		if (tagName.includes(' ')) {
			throw new Error('Spaces are not allowed in tag names.');
		}
	});

	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	story.passages.forEach(passage => {
		if (passage.tags.includes(oldTagName)) {
			commit('updatePassage', {
				passageId: passage.id,
				passageProps: {
					tags: passage.tags.map(tag => (tag === oldTagName ? newTagName : tag))
				},
				storyId: story.id
			});
		}
	});
}

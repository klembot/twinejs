const allowedColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

export function setTagColor({commit, getters}, {storyId, tagColor, tagName}) {
	if (typeof tagName !== 'string') {
		throw new Error('Tag names must be strings.');
	}

	if (tagName.includes(' ')) {
		throw new Error('Spaces are not allowed in tag names.');
	}

	if (!allowedColors.includes(tagColor)) {
		throw new Error(`"${tagColor}" is not a valid tag color.`);
	}

	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	const tagColors = typeof story.tagColors === 'object' ? story.tagColors : {};

	tagColors[tagName] = tagColor;
	commit('updateStory', {storyId, storyProps: {tagColors}});
}

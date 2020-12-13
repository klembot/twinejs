export function addPassageTag(
	{commit, getters},
	{passageId, storyId, tagName}
) {
	if (typeof tagName !== 'string') {
		throw new Error('Tag names must be strings.');
	}

	if (tagName.includes(' ')) {
		throw new Error('Spaces are not allowed in tag names.');
	}

	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	const passage = story.passages.find(p => p.id === passageId);

	if (!passage) {
		throw new Error(
			`There is no passage in this story with ID "${passageId}".`
		);
	}

	const tags = Array.isArray(passage.tags) ? passage.tags : [];

	if (tags.includes(tagName)) {
		return;
	}

	tags.push(tagName);
	commit('updatePassage', {passageId, passageProps: {tags}, storyId});
}

export function removePassageTag(
	{commit, getters},
	{passageId, storyId, tagName}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	const passage = story.passages.find(p => p.id === passageId);

	if (!passage) {
		throw new Error(
			`There is no passage in this story with ID "${passageId}".`
		);
	}

	const {tags} = passage;

	if (!Array.isArray(tags) || !tags.includes(tagName)) {
		return;
	}

	commit('updatePassage', {
		passageId,
		passageProps: {tags: tags.filter(t => t !== tagName)},
		storyId
	});
}

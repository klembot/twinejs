import {createRegExp, escapeRegExpReplace} from '@/util/regexp';

export function replaceInPassage(
	{commit, getters},
	{
		includePassageNames,
		matchCase,
		passageId,
		replace,
		search,
		storyId,
		useRegexes
	}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	const passage = story.passages.find(passage => passage.id === passageId);

	if (!passage) {
		throw new Error(
			`There is no passage in this story with ID "${passageId}".`
		);
	}

	const passageProps = {...passage};
	const matcher = createRegExp(search, {matchCase, useRegexes});
	const replacer = useRegexes ? replace : escapeRegExpReplace(replace);
	const newText = passage.text.replace(matcher, replacer);
	let newName = passage.name;

	if (includePassageNames) {
		newName = passage.name.replace(matcher, replacer);
	}

	/*
	The intent below is *not* to delete either name or text. Setting them as
	undefined means the mutation doesn't see the keys at all, and doesn't do a
	meaningless update.
	*/

	let updateNeeded = false;

	if (newName !== passage.name) {
		passageProps.name = newName;
		updateNeeded = true;
	}

	if (newText !== passage.text) {
		passageProps.text = newText;
		updateNeeded = true;
	}

	if (updateNeeded) {
		commit('updatePassage', {passageId, storyId, passageProps});
	}
}

export function replaceInStory(
	{commit, getters},
	{includePassageNames, matchCase, replace, search, storyId, useRegexes}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	story.passages.forEach(passage => {
		replaceInPassage(
			{commit, getters},
			{
				includePassageNames,
				matchCase,
				replace,
				search,
				storyId,
				useRegexes,
				passageId: passage.id
			}
		);
	});
}

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
	if (typeof replace !== 'string') {
		throw new Error('Replace is not a string.');
	}

	if (typeof search !== 'string') {
		throw new Error('Search is not a string.');
	}

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

	const passageProps = {};
	const matcher = createRegExp(search, {matchCase, useRegexes});
	const replacer = useRegexes ? replace : escapeRegExpReplace(replace);

	passageProps.text = passage.text.replace(matcher, replacer);

	if (includePassageNames) {
		passageProps.name = passage.name.replace(matcher, replacer);
	}

	if (
		passageProps.text !== passage.text ||
		(passageProps.name !== undefined && passageProps.name !== passage.name)
	) {
		commit('updatePassage', {passageId, storyId, passageProps});
	}
}

export function replaceInStory(
	{commit, getters},
	{includePassageNames, matchCase, replace, search, storyId, useRegexes}
) {
	const story = getters.storyWithId(storyId);

	if (typeof replace !== 'string') {
		throw new Error('Replace is not a string.');
	}

	if (typeof search !== 'string') {
		throw new Error('Search is not a string.');
	}

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

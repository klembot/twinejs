/*
Functions for finding a particular story in the state, or a particular passage
in a story. These do not complain if no results were found--you should handle
these cases yourself.
*/

import uniq from 'lodash.uniq';
import linkParser from '@/util/link-parser';

export const passageInStoryWithId = (state, {storyWithId}) => (
	storyId,
	passageId
) => {
	const story = storyWithId(storyId);

	if (!story) {
		return;
	}

	return story.passages.find(p => p.id === passageId);
};

export const storyWithId = state => id => state.stories.find(s => s.id === id);

export const storyWithName = state => name =>
	state.stories.find(s => s.name === name);

export const storyLinks = state => id => {
	const story = state.stories.find(s => s.id === id);

	if (!story) {
		return;
	}

	return story.passages.reduce((result, passage) => {
		result[passage.name] = uniq(linkParser(passage.text, true));
		return result;
	}, {});
};

export const storyStats = state => id => {
	const story = state.stories.find(s => s.id === id);

	if (!story) {
		return;
	}

	const links = story.passages.reduce(
		(links, passage) => [
			...links,
			...linkParser(passage.text).filter(link => links.indexOf(link) === -1)
		],
		[]
	);

	return {
		brokenLinks: -1,
		characters: story.passages.reduce(
			(count, passage) => count + passage.text.length,
			0
		),
		ifid: story.ifid,
		lastUpdate: story.lastUpdate,
		links: links.length,
		passages: story.passages.length,
		words: story.passages.reduce(
			(count, passage) => count + passage.text.split(/\s+/).length,
			0
		)
	};
};

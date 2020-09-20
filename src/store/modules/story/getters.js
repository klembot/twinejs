/*
Functions for finding a particular story in the state, or a particular passage
in a story. These do not complain if no results were found--you should handle
these cases yourself.
*/

import escape from 'lodash.escape';
import uniq from 'lodash.uniq';
import {createRegExp} from '@/util/regexp';
import linkParser from '@/util/link-parser';
import {passageSizes} from './passage-sizes';

export const passageInStoryWithId = (state, getters) => (
	storyId,
	passageId
) => {
	const story = getters.storyWithId(storyId);

	if (!story) {
		return;
	}

	return story.passages.find(p => p.id === passageId);
};

export const passagesInStoryMatchingSearch = (state, getters) => (
	storyId,
	search,
	{includePassageNames, matchCase, useRegexes}
) => {
	const story = getters.storyWithId(storyId);

	if (!story) {
		return [];
	}

	const matcher = createRegExp(search, {matchCase, useRegexes});

	function highlight(value) {
		return `\ue000${value}\ue001`;
	}

	function markHighlights(value) {
		return value.replace(/\ue000/g, '<mark>').replace(/\ue001/g, '</mark>');
	}

	return story.passages.reduce((result, passage) => {
		let nameHighlighted = escape(passage.name);
		let nameMatched = false;
		let textHighlighted = escape(passage.text);
		let textMatches = 0;

		if (includePassageNames) {
			nameMatched = matcher.test(passage.name);
			nameHighlighted = markHighlights(
				escape(passage.name.replace(matcher, highlight))
			);
		}

		textMatches = passage.text.match(matcher);
		textHighlighted = markHighlights(
			escape(passage.text.replace(matcher, highlight))
		);

		if (nameMatched || textMatches) {
			result.push({
				nameHighlighted,
				textHighlighted,
				textMatches: (textMatches && textMatches.length) || 0,
				passage
			});
		}

		return result;
	}, []);
};

export const passageSizeDescription = (state, getters) => (
	storyId,
	passageId
) => {
	const passage = getters.passageInStoryWithId(storyId, passageId);

	if (!passage) {
		return;
	}

	return Object.keys(passageSizes).find(sizeName => {
		const dimensions = passageSizes[sizeName];

		if (
			dimensions.height === passage.height &&
			dimensions.width === passage.width
		) {
			return sizeName;
		}
	});
};

export const storyDimensions = state => id => {
	const story = state.stories.find(s => s.id === id);

	let height = 0,
		width = 0;

	if (!story) {
		return {height, width};
	}

	story.passages.forEach(p => {
		const passageRight = p.left + p.width;
		const passageBottom = p.top + p.height;

		if (passageRight > width) {
			width = passageRight;
		}

		if (passageBottom > height) {
			height = passageBottom;
		}
	});

	return {height, width};
};

export const storyWithId = state => id => state.stories.find(s => s.id === id);

export const storyWithName = state => name =>
	state.stories.find(s => s.name === name);

export const storyLinks = state => id => {
	const story = state.stories.find(s => s.id === id);

	if (!story) {
		return {};
	}

	return story.passages.reduce((result, passage) => {
		result[passage.name] = uniq(linkParser(passage.text, true));
		return result;
	}, {});
};

export const storyStats = state => id => {
	const story = state.stories.find(s => s.id === id);

	if (!story) {
		return {};
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

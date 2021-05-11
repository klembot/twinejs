import escape from 'lodash/escape';
import uniq from 'lodash/uniq';
import {Passage, StorySearchFlags, Story} from './stories.types';
import {createRegExp} from '../../util/regexp';
import {parseLinks} from '../../util/parse-links';

/**
 * Returns a passage name and text with matches for a search highlighted with
 * `<mark>` tags. The result should be displayed as HTML with no escaping.
 */
export function markPassageMatches(
	passage: Passage,
	search: string,
	flags: StorySearchFlags
) {
	const {includePassageNames, matchCase, useRegexes} = flags;
	const matcher = createRegExp(search, {matchCase, useRegexes});
	const highlight = (value: string) => `\ue000${value}\ue001`;
	const markHighlights = (value: string) =>
		value.replace(/\ue000/g, '<mark>').replace(/\ue001/g, '</mark>');

	let nameHighlightedHtml = escape(passage.name);
	let textHighlightedHtml = escape(passage.text);

	if (includePassageNames) {
		nameHighlightedHtml = markHighlights(
			escape(passage.name.replace(matcher, highlight))
		);
	}

	textHighlightedHtml = markHighlights(
		escape(passage.text.replace(matcher, highlight))
	);

	return {
		nameHighlightedHtml,
		textHighlightedHtml
	};
}

export function passageWithId(
	stories: Story[],
	storyId: string,
	passageId: string
) {
	const story = storyWithId(stories, storyId);
	const result = story.passages.find(p => p.id === passageId);

	if (result) {
		return result;
	}

	throw new Error(
		`There is no passage with ID "${passageId}" in a story with ID "${storyId}".`
	);
}

export function passageWithName(
	stories: Story[],
	storyId: string,
	passageName: string
) {
	const story = storyWithId(stories, storyId);
	const result = story.passages.find(p => p.name === passageName);

	if (result) {
		return result;
	}

	throw new Error(
		`There is no passage with name "${passageName}" in a story with ID "${storyId}".`
	);
}

export function passageLinks(passages: Passage[]) {
	const passageMap = new Map(passages.map(p => [p.name, p]));
	const result = {
		draggable: {
			brokenLinks: new Set<Passage>(),
			links: new Map<Passage, Set<Passage>>(),
			selfLinks: new Set<Passage>()
		},
		fixed: {
			brokenLinks: new Set<Passage>(),
			links: new Map<Passage, Set<Passage>>(),
			selfLinks: new Set<Passage>()
		}
	};

	passages.forEach(passage =>
		parseLinks(passage.text).forEach(linkName => {
			if (linkName === passage.name) {
				(passage.selected ? result.draggable : result.fixed).selfLinks.add(
					passage
				);
			} else {
				const linkPassage = passageMap.get(linkName);

				if (linkPassage) {
					const target =
						passage.selected || linkPassage.selected
							? result.draggable
							: result.fixed;

					if (target.links.has(passage)) {
						target.links.get(passage)!.add(linkPassage);
					} else {
						target.links.set(passage, new Set([linkPassage]));
					}
				} else {
					(passage.selected ? result.draggable : result.fixed).brokenLinks.add(
						passage
					);
				}
			}
		})
	);

	return result;
}

/**
 * Returns all passages matching a search criteria. Use
 * `highlightPassageMatches()` to highlight exactly what matched.
 */
export function passagesMatchingSearch(
	passages: Passage[],
	search: string,
	flags: StorySearchFlags
): Passage[] {
	if (search === '') {
		return [];
	}

	const {includePassageNames, matchCase, useRegexes} = flags;
	const matcher = createRegExp(search, {matchCase, useRegexes});

	return passages.reduce((result, passage) => {
		if (
			matcher.test(passage.text) ||
			(includePassageNames && matcher.test(passage.name))
		) {
			return [...result, passage];
		}

		return result;
	}, [] as Passage[]);
}

export function storyStats(story: Story) {
	const links = story.passages.reduce<string[]>(
		(links, passage) => [
			...links,
			...parseLinks(passage.text).filter(link => links.indexOf(link) === -1)
		],
		[]
	);

	const brokenLinks = uniq(links).filter(
		link => !story.passages.some(passage => passage.name === link)
	);

	return {
		brokenLinks,
		links,
		characters: story.passages.reduce(
			(count, passage) => count + passage.text.length,
			0
		),
		passages: story.passages.length,
		words: story.passages.reduce(
			(count, passage) => count + passage.text.split(/\s+/).length,
			0
		)
	};
}

export function storyTags(stories: Story[]) {
	return Array.from(
		stories.reduce((result, story) => {
			story.tags && story.tags.forEach(tag => result.add(tag));
			return result;
		}, new Set<string>())
	).sort();
}

export function storyWithId(stories: Story[], storyId: string) {
	const result = stories.find(s => s.id === storyId);

	if (result) {
		return result;
	}

	throw new Error(`There is no story with ID "${storyId}".`);
}

export function storyWithName(stories: Story[], name: string) {
	const result = stories.find(s => s.name === name);

	if (result) {
		return result;
	}

	throw new Error(`There is no story with name "${name}".`);
}

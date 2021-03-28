import escape from 'lodash/escape';
import uniq from 'lodash/uniq';
import {
	Passage,
	PassageSearchResult,
	StorySearchFlags,
	Story
} from './stories.types';
import {createRegExp} from '../../util/regexp';
import {parseLinks} from '../../util/parse-links';

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
	const brokenLinks = new Set<Passage>();
	const links = new Map<Passage, Set<Passage>>();
	const selfLinks = new Set<Passage>();

	passages.forEach(passage =>
		parseLinks(passage.text).forEach(linkName => {
			if (linkName === passage.name) {
				(passage.selected
					? result.draggable
					: result.fixed
				).selfLinks.add(passage);
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
					(passage.selected
						? result.draggable
						: result.fixed
					).brokenLinks.add(passage);
				}
			}
		})
	);

	return result;
}

export function passagesMatchingSearch(
	passages: Passage[],
	search: string,
	flags: StorySearchFlags
): PassageSearchResult[] {
	if (search === '') {
		return [];
	}

	const {includePassageNames, matchCase, useRegexes} = flags;
	const matcher = createRegExp(search, {matchCase, useRegexes});
	const highlight = (value: string) => `\ue000${value}\ue001`;
	const markHighlights = (value: string) =>
		value.replace(/\ue000/g, '<mark>').replace(/\ue001/g, '</mark>');

	return passages.reduce<PassageSearchResult[]>((result, passage) => {
		let nameHighlighted = escape(passage.name);
		let nameMatched = false;
		let textHighlighted = escape(passage.text);
		const textMatches = passage.text.match(matcher);

		if (includePassageNames) {
			nameMatched = matcher.test(passage.name);
			nameHighlighted = markHighlights(
				escape(passage.name.replace(matcher, highlight))
			);
		}

		textHighlighted = markHighlights(
			escape(passage.text.replace(matcher, highlight))
		);

		if (nameMatched || textMatches) {
			result.push({
				nameHighlighted,
				textHighlighted,
				textMatches: textMatches?.length || 0,
				passage
			});
		}

		return result;
	}, []);
}

export function storyStats(story: Story) {
	const links = story.passages.reduce<string[]>(
		(links, passage) => [
			...links,
			...parseLinks(passage.text).filter(
				link => links.indexOf(link) === -1
			)
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

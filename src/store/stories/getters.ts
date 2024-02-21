import Fuse from 'fuse.js';
import uniq from 'lodash/uniq';
import {Passage, StorySearchFlags, Story} from './stories.types';
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

/**
 * Returns connections between passages in a structure optimized for rendering.
 * Connections are divided between draggable and fixed, depending on whether
 * either of their passages are selected (and could be dragged by the user).
 */
export function passageConnections(
	passages: Passage[],
	connectionParser?: (text: string) => string[]
) {
	const parser = connectionParser ?? ((text: string) => parseLinks(text, true));
	const passageMap = new Map(passages.map(p => [p.name, p]));
	const result = {
		draggable: {
			broken: new Set<Passage>(),
			connections: new Map<Passage, Set<Passage>>(),
			self: new Set<Passage>()
		},
		fixed: {
			broken: new Set<Passage>(),
			connections: new Map<Passage, Set<Passage>>(),
			self: new Set<Passage>()
		}
	};

	passages.forEach(passage =>
		parser(passage.text).forEach(targetName => {
			if (targetName === passage.name) {
				(passage.selected ? result.draggable : result.fixed).self.add(passage);
			} else {
				const targetPassage = passageMap.get(targetName);

				if (targetPassage) {
					const target =
						passage.selected || targetPassage.selected
							? result.draggable
							: result.fixed;

					if (target.connections.has(passage)) {
						target.connections.get(passage)!.add(targetPassage);
					} else {
						target.connections.set(passage, new Set([targetPassage]));
					}
				} else {
					(passage.selected ? result.draggable : result.fixed).broken.add(
						passage
					);
				}
			}
		})
	);

	return result;
}

/**
 * Returns a set of passages matching a fuzzy search crtieria.
 */
export function passagesMatchingFuzzySearch(
	passages: Passage[],
	search: string,
	count = 5
) {
	if (search.trim() === '') {
		return [];
	}

	const fuse = new Fuse(passages, {
		ignoreLocation: true,
		keys: [
			{name: 'name', weight: 0.6},
			{name: 'text', weight: 0.4}
		]
	});

	return fuse.search(search, {limit: count}).map(({item}) => item);
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
	let matcher: RegExp;

	try {
		matcher = createRegExp(search, {matchCase, useRegexes});
	} catch (error) {
		// The regexp was malformed. Take no action.
		return [];
	}

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

export function storyPassageTags(story: Story) {
	return Array.from(
		story.passages.reduce((result, passage) => {
			passage.tags && passage.tags.forEach(tag => result.add(tag));
			return result;
		}, new Set<string>())
	).sort();
}

export function passageTagFrequencies(story: Story) {
	const tagPassageCounts: { [key: string]: number } = {};
  
	story.passages.forEach(passage => {
		if (passage.tags) {
			passage.tags.forEach(tag=>{
				if (!tagPassageCounts[tag]) {
					tagPassageCounts[tag] = 1; 
			  	} else {
					tagPassageCounts[tag] += 1; 
			  	}
		})};
	});
	return tagPassageCounts;
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

export function storyTagFrequencies(stories: Story[]) {
    const tagFrequencies: {[key: string]: number} = {};

    stories.forEach(story => {
        if (story.tags) {
            story.tags.forEach(tag => {
                tagFrequencies[tag] = (tagFrequencies[tag] || 0) + 1;
            });
        }
    });

    return tagFrequencies;
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

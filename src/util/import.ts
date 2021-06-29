// Handles importing HTML source code into story objects ready to be saved to
// the store. This works on both published story files and archives.
//
// It's important that this code be as efficient as possible, as it directly
// affects startup time in the Twine desktop app. This module moves data from
// the filesystem into local storage, and the app can't begin until it's done.

import defaults from 'lodash/defaults';
import uuid from 'tiny-uuid';
import {passageDefaults, storyDefaults, Passage, Story} from '../store/stories';

/**
 * An imported story, which may contain incomplete or malformed data.
 */
export interface ImportedStory extends Omit<Partial<Story>, 'passages'> {
	passages: Partial<Passage>[];
}

/**
 * HTML selectors used to find data in HTML format.
 */
const selectors = {
	passage: 'tw-passage',
	story: 'tw-story',
	script: '[role=script]',
	stylesheet: '[role=stylesheet]',
	storyData: 'tw-storydata',
	tagColors: 'tw-tag',
	passageData: 'tw-passagedata'
};

/**
 * Convenience function to convert a string value to an float.
 */
function float(stringValue: string) {
	return parseFloat(stringValue);
}

/**
 * Convenience function to query an element by a selector.
 */
function query(el: Element, selector: string) {
	return Array.from(el.querySelectorAll(selector));
}

/**
 * Convenience function to parse a string like "100,50".
 */
function parseDimensions(raw: any): [string, string] | undefined {
	if (typeof raw !== 'string') {
		return undefined;
	}

	const bits = raw.split(',');

	if (bits.length === 2) {
		return [bits[0], bits[1]];
	}

	return undefined;
}

/**
 * Converts a DOM <tw-storydata> element to a story object matching the format
 * in the store. This *may* be missing data, or data it returns may be
 * malformed. This function does its best to reflect the contents of the
 * element.
 */
function domToObject(storyEl: Element): ImportedStory {
	const startPassagePid = storyEl.getAttribute('startnode');
	let startPassageId: string | undefined = undefined;
	const story: ImportedStory = {
		ifid: storyEl.getAttribute('ifid') ?? uuid(),
		id: uuid(),
		lastUpdate: undefined,
		name: storyEl.getAttribute('name') ?? undefined,
		storyFormat: storyEl.getAttribute('format') ?? undefined,
		storyFormatVersion: storyEl.getAttribute('format-version') ?? undefined,
		script: query(storyEl, selectors.script)
			.map(el => el.textContent)
			.join('\n'),
		stylesheet: query(storyEl, selectors.stylesheet)
			.map(el => el.textContent)
			.join('\n'),
		tags: storyEl.getAttribute('tags')
			? storyEl.getAttribute('tags')!.split(/\s+/)
			: [],
		zoom: parseFloat(storyEl.getAttribute('zoom') ?? '1'),
		tagColors: query(storyEl, selectors.tagColors).reduce((result, el) => {
			const tagName = el.getAttribute('name');

			if (typeof tagName !== 'string') {
				return result;
			}

			return {...result, [tagName]: el.getAttribute('color')};
		}, {}),
		passages: query(storyEl, selectors.passageData).map(passageEl => {
			const id = uuid();
			const position = parseDimensions(passageEl.getAttribute('position'));
			const size = parseDimensions(passageEl.getAttribute('size'));

			if (passageEl.getAttribute('pid') === startPassagePid) {
				startPassageId = id;
			}

			return {
				id,
				left: position ? float(position[0]) : undefined,
				top: position ? float(position[1]) : undefined,
				width: size ? float(size[0]) : undefined,
				height: size ? float(size[1]) : undefined,
				tags: passageEl.getAttribute('tags')
					? passageEl.getAttribute('tags')!.split(/\s+/)
					: [],
				name: passageEl.getAttribute('name') ?? undefined,
				text: passageEl.textContent ?? undefined
			};
		})
	};

	story.startPassage = startPassageId;
	return story;
}

/**
 * Imports stories from HTML. If there are any missing attributes in the HTML,
 * defaults will be applied.
 */
export function importStories(
	html: string,
	lastUpdateOverride?: Date
): Story[] {
	const nodes = document.createElement('div');

	nodes.innerHTML = html;

	return query(nodes, selectors.storyData).map(storyEl => {
		const importedStory = domToObject(storyEl);

		// Merge in defaults. We can't use object spreads here because undefined
		// values would override defaults.

		const story: Story = defaults(importedStory, {id: uuid()}, storyDefaults());

		// Override the last update as requested.

		if (lastUpdateOverride) {
			story.lastUpdate = lastUpdateOverride;
		}

		// Merge in passage defaults. We don't need to set ID here--domToObject did
		// this for us.

		story.passages = story.passages.map(passage =>
			defaults(passage, passageDefaults(), {story: story.id})
		);

		return story;
	});
}

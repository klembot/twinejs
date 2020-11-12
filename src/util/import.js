/*
Handles importing HTML source code into story objects ready to be saved to the
store. This works on both published story files and archives.

It's important that this code be as efficient as possible, as it directly
affects startup time in the Twine desktop app. This module moves data from the
filesystem into local storage, and the app can't begin until it's done.
*/

import uuid from 'tiny-uuid';

/* HTML selectors used to find data in HTML format. */

const selectors = {
	passage: 'tw-passage',
	story: 'tw-story',
	script: '[role=script]',
	stylesheet: '[role=stylesheet]',
	storyData: 'tw-storydata',
	tagColors: 'tw-tag',
	passageData: 'tw-passagedata'
};

function attrib(el, attributeName) {
	return el.attributes[attributeName]
		? el.attributes[attributeName].value
		: undefined;
}

function int(stringValue) {
	return Math.floor(parseFloat(stringValue));
}

function query(el, selector) {
	return Array.from(el.querySelectorAll(selector));
}

function parseDimensions(raw) {
	if (typeof raw !== 'string') {
		return undefined;
	}

	const bits = raw.split(',');

	if (bits.length == 2) {
		return bits;
	}

	return undefined;
}

/*
Converts a DOM <tw-storydata> element to a story object matching the format in
the store. This *may* be missing data, or data it returns may be malformed. This
function does its best to reflect the contents of the element.
*/

function domToObject(storyEl) {
	const startPassagePid = attrib(storyEl, 'startnode');
	let startPassageId;
	const story = {
		ifid: attrib(storyEl, 'ifid'),
		id: uuid(),
		name: attrib(storyEl, 'name'),
		storyFormat: attrib(storyEl, 'format'),
		storyFormatVersion: attrib(storyEl, 'format-version'),
		script: query(storyEl, selectors.script)
			.map(el => el.textContent)
			.join('\n'),
		stylesheet: query(storyEl, selectors.stylesheet)
			.map(el => el.textContent)
			.join('\n'),
		zoom: storyEl.attributes.zoom
			? parseFloat(storyEl.attributes.zoom.value)
			: 1,
		tagColors: query(storyEl, selectors.tagColors).reduce((src, el) => {
			src[el.attributes.name.value] = el.attributes.color.value;
			return src;
		}, {}),
		passages: query(storyEl, selectors.passageData).map(passageEl => {
			const id = uuid();
			const position = parseDimensions(attrib(passageEl, 'position'));
			const size = parseDimensions(attrib(passageEl, 'size'));

			if (attrib(passageEl, 'pid') === startPassagePid) {
				startPassageId = id;
			}

			return {
				id,
				left: position ? int(position[0]) : undefined,
				top: position ? int(position[1]) : undefined,
				width: size ? int(size[0]) : undefined,
				height: size ? int(size[1]) : undefined,
				tags:
					passageEl.attributes.tags.value === ''
						? []
						: passageEl.attributes.tags.value.split(/\s+/),
				name: passageEl.attributes.name.value,
				text: passageEl.textContent
			};
		})
	};

	story.startPassage = startPassageId;
	return story;
}

export function importStories(html, lastUpdate) {
	const nodes = document.createElement('div');

	nodes.innerHTML = html;

	return query(nodes, selectors.storyData).map(storyEl => {
		const story = domToObject(storyEl);

		if (lastUpdate) {
			story.lastUpdate = lastUpdate;
		}

		return story;
	});
}

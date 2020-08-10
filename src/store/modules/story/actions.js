import {intersects} from '@/util/rect';
import linkParser from '@/util/link-parser';
import {passageDefaults, storyDefaults} from './defaults';

export function changeZoom({commit, getters}, {change, storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	/*
	Clamp between 10% and 200%.
	*/

	const newZoom = Math.max(Math.min(story.zoom + change, 2), 0.1);

	if (newZoom !== story.zoom) {
		commit('updateStory', {storyId, storyProps: {zoom: newZoom}});
	}
}

export function createNewlyLinkedPassages(
	{commit, getters},
	{oldText, passageId, storyId}
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

	const oldLinks = linkParser(oldText);
	const toCreate = linkParser(passage.text).filter(
		l => !oldLinks.includes(l) && !story.passages.some(p => p.name === l)
	);

	if (toCreate.length === 0) {
		return;
	}

	/*
	Some magic numbers here to get passages to match the grid. We assume passage
	default dimensions of 100x100 and a grid size of 25.
	*/

	const passageGap = 50;

	const newTop = passage.top + passage.height + passageGap;
	const newPassagesWidth =
		toCreate.length * passageDefaults.width +
		(toCreate.length - 1) * passageGap;

	/*
	Horizontally center the passages.
	*/

	let newLeft = passage.left + (passage.width - newPassagesWidth) / 2;

	/*
	Actually create them.
	*/

	toCreate.forEach(name => {
		createPassage(
			{commit, getters},
			{
				storyId,
				passageProps: {
					name,
					left: newLeft,
					top: newTop
				}
			}
		);
		newLeft += passageDefaults.width + passageGap;
	});
}

export function createPassage({commit, getters}, {passageProps, storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	/*
	If a passage with this name already exists, don't do anything.
	*/

	if (story.passages.some(p => p.name === passageProps.name)) {
		throw new Error(
			`There is already a passage in this story named "${passageProps.name}".`
		);
	}

	commit('createPassage', {passageProps, storyId});
}

export function createStory({commit}, {storyProps}) {
	commit('createStory', {storyProps});
}

/*
Works with one or more <tw-storydata> elements, as a Twine archive may contain
more than one. Doesn't do any validation; that happens via ./cleanup.js. Returns
how many stories it created.
*/

export function createStoriesFromHtml({commit}, {html, lastUpdate}) {
	lastUpdate = lastUpdate || new Date();

	const storyDataAttribute = (el, attributeName, defaultValue = null) =>
		el.attributes[attributeName]
			? el.attributes[attributeName].value
			: defaultValue;
	const joinSelectorContents = (el, selector) =>
		Array.from(el.querySelectorAll(selector)).join('\n');
	const parsePassageData = el => {
		const pos = el.attributes.position.value.split(',').map(Math.floor);
		let size = [100, 100];

		if (el.attributes.size) {
			size = el.attributes.size.value.split(',').map(Math.floor);
		}

		return {
			pid: el.attributes.pid.value,
			left: pos[0],
			top: pos[1],
			width: size[0],
			height: size[1],
			selected: false,
			tags:
				el.attributes.tags.value === ''
					? []
					: el.attributes.tags.value.split(/\s+/),
			name: el.attributes.name.value,
			text: el.textContent
		};
	};

	const dom = document.createElement('div');

	dom.innerHTML = html;

	const toCreate = Array.from(dom.querySelectorAll('tw-storydata'));

	toCreate.forEach(storyDataEl => {
		createStory(
			{commit},
			{
				storyProps: {
					lastUpdate,
					startPassagePid: storyDataAttribute(storyDataEl, 'startnode'),
					name: storyDataAttribute(storyDataEl, 'name'),
					ifid: storyDataAttribute(storyDataEl, 'ifid'),
					passages: Array.from(
						storyDataEl.querySelectorAll('tw-passagedata')
					).map(parsePassageData),
					storyFormat: storyDataAttribute(storyDataEl, 'format'),
					storyFormatVersion: storyDataAttribute(storyDataEl, 'format-version'),
					script: joinSelectorContents(storyDataEl, '[role=script]'),
					stylesheet: joinSelectorContents(storyDataEl, '[role=stylesheet]'),
					tagColors: Array.from(storyDataEl.querySelectorAll('tw-tag')).reduce(
						(result, el) => ({
							...result,
							[el.getAttribute('name')]: el.getAttribute('color')
						}),
						{}
					),
					zoom: parseFloat(storyDataAttribute(storyDataEl, 'zoom', 1))
				}
			}
		);
	});

	return toCreate.length;
}

export function createUntitledPassage(
	{commit, getters},
	{centerX, centerY, storyId}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	let passageName = passageDefaults.name;

	/*
	If a passage already exists with that name, add a number and keep
	incrementing until we get a unique one.
	*/

	if (story.passages.some(p => p.name === passageName)) {
		let suffix = 1;

		while (story.passages.some(p => p.name === passageName + ' ' + suffix)) {
			suffix++;
		}

		passageName += ' ' + suffix;
	}

	/*
	Center it at the position requested. TODO: move it so it doesn't overlap
	another passage.
	*/

	const passageProps = {
		storyId,
		name: passageName,
		left: centerX - passageDefaults.width / 2,
		top: centerY - passageDefaults.height / 2
	};

	commit('createPassage', {passageProps, storyId});
}

export function deletePassage({commit, getters}, {passageId, storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	if (!story.passages.some(p => p.id === passageId)) {
		throw new Error(`There is no passage in this story named "${passageId}".`);
	}

	commit('deletePassage', {passageId, storyId});
}

export function deselectPassages({commit, getters}, {storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	story.passages.forEach(p => {
		if (p.selected) {
			commit('updatePassage', {
				storyId,
				passageId: p.id,
				passageProps: {selected: false}
			});
		}
	});
}

export function highlightPassagesWithText(
	{commit, getters},
	{search, storyId}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	/* Special case empty string to match nothing. */

	const matcher = new RegExp(search === '' ? '^$' : search, 'i');

	story.passages.forEach(p => {
		const oldHighlighted = p.highlighted;
		const newHighlighted = matcher.test(p.name) || matcher.test(p.text);

		if (newHighlighted !== oldHighlighted) {
			commit('updatePassage', {
				storyId,
				passageId: p.id,
				passageProps: {highlighted: newHighlighted}
			});
		}
	});
}

export function moveSelectedPassages(
	{commit, getters},
	{xChange, yChange, storyId}
) {
	if (typeof xChange !== 'number' || isNaN(xChange)) {
		throw new Error(
			`${xChange} is not a valid offset to move passages horizontally.`
		);
	}

	if (typeof yChange !== 'number' || isNaN(yChange)) {
		throw new Error(
			`${yChange} is not a valid offset to move passages vertically.`
		);
	}

	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	story.passages.forEach(p => {
		if (p.selected) {
			// TODO: clean up overlaps

			let left = p.left + xChange;
			let top = p.top + yChange;

			if (story.snapToGrid) {
				left = Math.round(left / 25) * 25;
				top = Math.round(top / 25) * 25;
			}

			commit('updatePassage', {
				storyId,
				passageId: p.id,
				passageProps: {left, top}
			});
		}
	});
}

export function repairStories({commit, rootState, state}) {
	state.stories.forEach(story => {
		const storyFixes = Object.keys(storyDefaults).reduce(
			(result, defaultName) => {
				if (typeof story[defaultName] !== typeof storyDefaults[defaultName]) {
					/*
					If the default is an object, we need to copy it so stories
					remain separate.
					*/

					if (typeof storyDefaults[name] === 'object') {
						result[defaultName] = {...storyDefaults[defaultName]};
					} else {
						result[defaultName] = storyDefaults[defaultName];
					}
				}

				return result;
			},
			{}
		);

		/*
		Set the default story format. This will be an empty string at worst
		because of defaults being applied above.
		*/

		if (story.storyFormat === '' || story.storyFormatVersion === '') {
			console.warn(`Setting default story format on story ID ${story.id}`);
			commit('updateStory', {
				storyId: story.id,
				storyProps: {
					storyFormat: rootState.pref.storyFormat.name,
					storyFormatVersion: rootState.pref.storyFormat.version
				}
			});
		}

		if (Object.keys(storyFixes).length !== 0) {
			console.warn(
				`Fixing story properties of story ID ${story.id}`,
				storyFixes
			);
			commit('updateStory', {storyId: story.id, storyProps: storyFixes});
		}

		/*
		If the starting passage doesn't exist, repair that.
		*/

		if (
			story.passages.length > 0 &&
			!story.passages.some(p => p.id === story.startPassage)
		) {
			console.warn(
				`Story ID ${story.id} has bad start passage ID (${story.startPassage}), resetting to first one`
			);

			commit('updateStory', {
				storyId: story.id,
				storyProps: {startPassage: story.passages[0].id}
			});
		}

		story.passages.forEach(p => {
			const passageFixes = Object.keys(passageDefaults).reduce(
				(result, defaultName) => {
					if (typeof story[defaultName] !== typeof storyDefaults[defaultName]) {
						/*
						If the default is an object, we need to copy it so stories
						remain separate.
						*/

						if (typeof storyDefaults[name] === 'object') {
							result[defaultName] = {...storyDefaults[defaultName]};
						} else {
							result[defaultName] = storyDefaults[defaultName];
						}
					}

					return result;
				},
				{}
			);

			if (Object.keys(passageFixes).length !== 0) {
				console.warn(
					`Fixing passage ID ${p.id} properties of story ID ${story.id}`,
					passageFixes
				);
				commit('updatePassage', {
					passageId: p.id,
					passageProps: passageFixes,
					storyId: story.id
				});
			}
		});
	});
}

export function selectAllPassages({commit, getters}, {storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	story.passages.forEach(p => {
		if (!p.selected) {
			commit('updatePassage', {
				passageId: p.id,
				storyId,
				passageProps: {selected: true}
			});
		}
	});
}

export function selectPassage(
	{commit, getters},
	{exclusive, passageId, storyId}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	commit('updatePassage', {passageId, storyId, passageProps: {selected: true}});

	if (exclusive) {
		story.passages.forEach(p => {
			if (p.id !== passageId && p.selected) {
				commit('updatePassage', {
					passageId,
					storyId,
					passageProps: {selected: false}
				});
			}
		});
	}
}

export function selectPassagesInRect(
	{commit, getters},
	{height, ignore, left, storyId, top, width}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	const selectRect = {height, left, top, width};

	story.passages.forEach(p => {
		if (ignore.find(r => r.id === p.id)) {
			/*
			We are ignoring this passage, e.g. this is an additive selection and
			it was already selected.
			*/
			return;
		}

		commit('updatePassage', {
			storyId,
			passageId: p.id,
			passageProps: {selected: intersects(selectRect, p)}
		});
	});
}

export function updatePassage({commit}, {passageId, passageProps, storyId}) {
	commit('updatePassage', {passageId, passageProps, storyId});
}

export function updateStory({commit}, {storyId, storyProps}) {
	commit('updateStory', {storyId, storyProps});
}

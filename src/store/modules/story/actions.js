import {intersects} from '../../../util/rect';
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

			commit('updatePassage', {
				storyId,
				passageId: p.id,
				passageProps: {left: p.left + xChange, top: p.top + yChange}
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

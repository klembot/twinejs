/* Functions for moving story formats in and out of local storage. */

import uuid from 'tiny-uuid';

export function save({state}) {
	/*
	Delete existing formats in local storage, since we aren't bothering to
	preserve ids.
	*/

	const previouslySerialized = window.localStorage.getItem(
		'twine-storyformats'
	);

	if (previouslySerialized) {
		previouslySerialized.split(',').forEach(id => {
			window.localStorage.removeItem(`twine-storyformats-${id}`);
		});
	}

	/* Save new ones. */

	let ids = [];

	state.storyFormat.formats.forEach(format => {
		const id = uuid();

		/*
		We have to remove the `properties` property if it exists, as that
		is dynamically added when loading.
		*/

		ids.push(id);
		window.localStorage.setItem(
			`twine-storyformats-${id}`,
			JSON.stringify({
				...format,
				loadError: undefined,
				loading: undefined,
				properties: undefined
			})
		);
	});

	window.localStorage.setItem('twine-storyformats', ids.join(','));
}

export function load({commit}) {
	const serialized = window.localStorage.getItem('twine-storyformats');

	if (!serialized) {
		return;
	}

	serialized.split(',').forEach(id => {
		try {
			const storyFormatProps = JSON.parse(
				window.localStorage.getItem(`twine-storyformats-${id}`)
			);

			commit('storyFormat/createFormat', {storyFormatProps});
		} catch (e) {
			console.warn(
				`Story format ${id} had corrupt serialized value, skipping`,
				window.localStorage.getItem(`twine-storyformats-${id}`)
			);
		}
	});
}

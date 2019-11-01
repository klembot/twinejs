/*
Functions for moving prefs in and out of local storage.
*/

import uuid from 'tiny-uuid';

export function save({state}) {
	/*
	Delete existing prefs in local storage, since we aren't bothering to
	preserve ids.
	*/

	const previouslySerialized = window.localStorage.getItem('twine-prefs');

	if (previouslySerialized) {
		previouslySerialized.split(',').forEach(id => {
			window.localStorage.removeItem(`twine-prefs-${id}`);
		});
	}

	/* Save new ones. */

	let ids = [];

	Object.keys(state.pref).forEach(name => {
		const id = uuid();

		ids.push(id);
		window.localStorage.setItem(
			`twine-prefs-${id}`,
			JSON.stringify({
				id,
				name,
				value: state.pref[name]
			})
		);
	});

	window.localStorage.setItem('twine-prefs', ids.join(','));
}

export function load({commit}) {
	const serialized = window.localStorage.getItem('twine-prefs');
	const toLoad = {};

	if (!serialized) {
		return;
	}

	serialized.split(',').forEach(id => {
		try {
			const item = JSON.parse(window.localStorage.getItem(`twine-prefs-${id}`));

			toLoad[item.name] = item.value;
		} catch (err) {
			console.warn(
				`Preference ${id} had corrupt serialized value, skipping`,
				window.localStorage.getItem(`twine-prefs-${id}`),
				err
			);
		}
	});

	commit('pref/update', toLoad);
}

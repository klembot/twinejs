/*
Functions for moving prefs in and out of local storage.
*/

import uuid from 'tiny-uuid';

export function save(store) {
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

	console.log('store.state.pref', store.state.pref);

	Object.keys(store.state.pref).forEach(name => {
		console.log(
			JSON.stringify({
				id,
				name,
				value: store.state.pref[name]
			})
		);

		const id = uuid();

		ids.push(id);
		window.localStorage.setItem(
			`twine-prefs-${id}`,
			JSON.stringify({
				id,
				name,
				value: store.state.pref[name]
			})
		);
		console.log('saving', name, store.state.pref[name]);
	});

	window.localStorage.setItem('twine-prefs', ids.join(','));
}

export function load({dispatch}) {
	const serialized = window.localStorage.getItem('twine-prefs');

	if (!serialized) {
		return;
	}

	serialized.split(',').forEach(id => {
		try {
			const item = JSON.parse(window.localStorage.getItem(`twine-prefs-${id}`));
			console.log('restoring pref', item.name, item.value);
			dispatch('pref/update', {[item.name]: item.value});
		} catch (err) {
			console.warn(
				`Preference ${id} had corrupt serialized value, skipping`,
				window.localStorage.getItem(`twine-prefs-${id}`),
				err
			);
		}
	});
}

import uuid from 'tiny-uuid';
import {PrefsState} from '../../../prefs';

export function save(state: PrefsState) {
	// Delete existing prefs in local storage, since we aren't bothering to
	// preserve IDs.

	const previouslySerialized = window.localStorage.getItem('twine-prefs');

	if (previouslySerialized) {
		previouslySerialized.split(',').forEach(id => {
			window.localStorage.removeItem(`twine-prefs-${id}`);
		});
	}

	/* Save new ones. */

	let ids: string[] = [];

	for (const name in state) {
		const id = uuid();

		ids.push(id);
		window.localStorage.setItem(
			`twine-prefs-${id}`,
			JSON.stringify({
				id,
				name,
				value: state[name as keyof PrefsState]
			})
		);
	}

	window.localStorage.setItem('twine-prefs', ids.join(','));
}

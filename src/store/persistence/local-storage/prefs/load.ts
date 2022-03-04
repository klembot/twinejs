import {PrefsState} from '../../../prefs';

export async function load(): Promise<Partial<PrefsState>> {
	const serialized = window.localStorage.getItem('twine-prefs');
	const result: Partial<PrefsState> = {};

	if (!serialized) {
		return {};
	}

	serialized.split(',').forEach(id => {
		try {
			const serializedPref = window.localStorage.getItem(`twine-prefs-${id}`);

			if (!serializedPref) {
				console.warn(`No preference stored at twine-prefs-${id}`);
				return;
			}

			const item = JSON.parse(serializedPref);

			(result as any)[item.name] = item.value;
		} catch (e) {
			console.warn(
				`Preference ${id} had corrupt serialized value, skipping`,
				window.localStorage.getItem(`twine-prefs-${id}`),
				e
			);
		}
	});

	return result;
}

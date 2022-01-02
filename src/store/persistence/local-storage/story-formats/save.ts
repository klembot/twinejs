import uuid from 'tiny-uuid';
import {StoryFormatsState} from '../../../story-formats/story-formats.types';

export function save(state: StoryFormatsState) {
	// Delete existing formats in local storage, since we aren't bothering to
	// preserve ids.

	const previouslySerialized = window.localStorage.getItem(
		'twine-storyformats'
	);

	if (previouslySerialized) {
		previouslySerialized.split(',').forEach(id => {
			window.localStorage.removeItem(`twine-storyformats-${id}`);
		});
	}

	// Save new ones.

	let ids: string[] = [];

	state.forEach(format => {
		const id = uuid();

		// We have to remove the `properties` property if it exists, as that is
		// dynamically added when loading.

		ids.push(id);
		window.localStorage.setItem(
			`twine-storyformats-${id}`,
			JSON.stringify({
				...format,
				loadError: undefined,
				loadState: undefined,
				properties: undefined,
				selected: undefined
			})
		);
	});

	window.localStorage.setItem('twine-storyformats', ids.join(','));
}

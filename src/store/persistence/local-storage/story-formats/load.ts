import {StoryFormatsState} from '../../../story-formats/story-formats.types';

export async function load(): Promise<StoryFormatsState> {
	const result: StoryFormatsState = [];
	const serialized = window.localStorage.getItem('twine-storyformats');

	if (!serialized) {
		return [];
	}

	serialized.split(',').forEach(id => {
		try {
			const serializedFormat = window.localStorage.getItem(
				`twine-storyformats-${id}`
			);

			if (!serializedFormat) {
				console.warn(
					`No story format stored at twine-storyformats-${id}, skipping`
				);
				return;
			}

			result.push({...JSON.parse(serializedFormat), loadState: 'unloaded'});
		} catch (e) {
			console.warn(
				`Story format ${id} had corrupt serialized value, skipping`,
				window.localStorage.getItem(`twine-storyformats-${id}`)
			);
		}
	});

	return result;
}

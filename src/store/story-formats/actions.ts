import {fetchStoryFormatProperties} from '../../util/fetch-story-format-properties';
import {
	StoryFormat,
	StoryFormatProperties,
	StoryFormatsDispatch
} from './story-formats.types';

/**
 * Loads all format properties, resolving when all properties have finished
 * trying to load--some may have failed. If loading previously failed, this will
 * try again.
 */
export async function loadAllFormatProperties(
	dispatch: StoryFormatsDispatch,
	formats: StoryFormat[]
) {
	const toLoad = formats.filter(f => f.loadState !== 'loaded');

	if (!toLoad) {
		return;
	}

	return await Promise.allSettled(
		toLoad.map(format => loadFormatProperties(dispatch, format))
	);
}

/**
 * Loads a format's properties, resolving to the properties if the format has
 * already been loaded, or if loading succeeds. If loading fails, the returned
 * promise will reject. If loading previously failed, this function will try
 * again.
 */
export async function loadFormatProperties(
	dispatch: StoryFormatsDispatch,
	format: StoryFormat
): Promise<StoryFormatProperties> {
	if (format.loadState === 'loaded') {
		return format.properties;
	}
	dispatch({
		type: 'update',
		id: format.id,
		props: {loadState: 'loading'}
	});

	try {
		const properties = await fetchStoryFormatProperties(format.url);
		dispatch({
			type: 'update',
			id: format.id,
			props: {properties, loadState: 'loaded'}
		});
		return properties;
	} catch (e) {
		dispatch({
			type: 'update',
			id: format.id,
			props: {loadState: 'error', loadError: e}
		});

		// Rethrow so our caller sees it.

		throw e;
	}
}

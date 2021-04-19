import {Thunk} from 'react-hook-thunk-reducer';
import {fetchStoryFormatProperties} from '../../util/fetch-story-format-properties';
import {
	StoryFormat,
	StoryFormatsAction,
	StoryFormatsDispatch
} from './story-formats.types';

async function loadFormatThunk(
	format: StoryFormat,
	dispatch: StoryFormatsDispatch
) {
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
	}
}

/**
 * Loads all format properties. If loading previously failed, this will try
 * again.
 */
export function loadAllFormatProperties(
	formats: StoryFormat[]
): Thunk<StoryFormat[], StoryFormatsAction> {
	const toLoad = formats.filter(f => f.loadState !== 'loaded');

	if (!toLoad) {
		return () => {};
	}

	return async (dispatch: StoryFormatsDispatch) => {
		await Promise.allSettled(
			toLoad.map(format => loadFormatThunk(format, dispatch))
		);
	};
}

/**
 * Loads a format's properties. If loading previously failed, this function will
 * try again.
 */
export function loadFormatProperties(format: StoryFormat) {
	if (format.loadState === 'loaded') {
		return () => {};
	}

	return async (dispatch: StoryFormatsDispatch) =>
		await loadFormatThunk(format, dispatch);
}

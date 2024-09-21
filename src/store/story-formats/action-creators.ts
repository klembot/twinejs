import {Thunk} from 'react-hook-thunk-reducer';
import {fetchStoryFormatProperties} from '../../util/story-format/fetch-properties';
import {
	StoryFormat,
	StoryFormatProperties,
	StoryFormatsAction,
	StoryFormatsDispatch
} from './story-formats.types';

/**
 * Creates a new story format based on properties (probably loaded externally).
 */
export function createFromProperties(
	url: string,
	properties: StoryFormatProperties
): StoryFormatsAction {
	if (!properties.name || !properties.version) {
		throw new Error('Missing required properties for a new story format');
	}

	return {
		type: 'create',
		props: {
			url,
			name: properties.name,
			userAdded: true,
			version: properties.version
		}
	};
}

/**
 * Deletes a story format.
 */
export function deleteFormat(format: StoryFormat): StoryFormatsAction {
	return {type: 'delete', id: format.id};
}

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
		let properties = await fetchStoryFormatProperties(format.url);

		// If the format contains a `hydrate` property, try running it and merge in
		// properties that function creates by modifiying what's bound to its
		// `this`. This allows creation of properties that can't be serialized to
		// JSON on the format. The hydrate function cannot override properties
		// already present in the format properties, e.g. to change its source.

		if (properties.hydrate) {
			try {
				const hydrateResult: Partial<StoryFormatProperties> = {};

				// eslint-disable-next-line no-new-func
				const hydrateFunc = new Function(properties.hydrate);

				hydrateFunc.call(hydrateResult);
				properties = {...hydrateResult, ...properties};
			} catch (e) {
				console.error(
					`Format ${format.id} has a hydrate property but it threw an error when called`,
					e
				);
			}
		}

		dispatch({
			type: 'update',
			id: format.id,
			props: {properties, loadState: 'loaded'}
		});

		return properties;
	} catch (loadError) {
		dispatch({
			type: 'update',
			id: format.id,
			props: {loadError: loadError as unknown as Error, loadState: 'error'}
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
	const toLoad = formats.filter(
		f => f.loadState !== 'loaded' && f.loadState !== 'loading'
	);

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
 * try again. This returns a thunk which in turns returns a promise resolving to
 * the format properties, which can be useful if you need them immediately.
 */
export function loadFormatProperties(format: StoryFormat) {
	if (format.loadState === 'loaded') {
		return () => format.properties;
	}

	return async (dispatch: StoryFormatsDispatch) =>
		await loadFormatThunk(format, dispatch);
}

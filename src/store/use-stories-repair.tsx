import React from 'react';
import {defaults, usePrefsContext} from './prefs';
import {useStoriesContext} from './stories';
import {
	formatWithNameAndVersion,
	StoryFormat,
	useStoryFormatsContext
} from './story-formats';

/**
 * A React hook to dispatch a repair action on the stories store. Like
 * publishing, this spans the stories, preferences, and formats stores.
 */
export function useStoriesRepair() {
	const {dispatch} = useStoriesContext();
	const {prefs} = usePrefsContext();
	const {formats} = useStoryFormatsContext();

	return React.useCallback(() => {
		// We try to repair stories to the user's preferred format, but perhaps
		// their prefs are out of date/corrupted. In that case, we use the default
		// one.

		let safeFormat: StoryFormat | undefined;

		try {
			safeFormat = formatWithNameAndVersion(
				formats,
				prefs.storyFormat.name,
				prefs.storyFormat.version
			);
		} catch {
			try {
				safeFormat = formatWithNameAndVersion(
					formats,
					defaults().storyFormat.name,
					defaults().storyFormat.version
				);
			} catch (error) {
				console.error(
					`Could not locate a safe story format, skipping story repair: ${
						(error as Error).message
					}`
				);
			}
		}

		if (safeFormat) {
			dispatch({
				type: 'repair',
				allFormats: formats,
				defaultFormat: safeFormat
			});
		}
	}, [formats, prefs.storyFormat.name, prefs.storyFormat.version, dispatch]);
}

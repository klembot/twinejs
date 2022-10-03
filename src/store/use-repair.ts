import React from 'react';
import {usePrefsContext} from './prefs';
import {useStoriesContext} from './stories';
import {
	formatWithNameAndVersion,
	useStoryFormatsContext
} from './story-formats';

export interface UseRepairProps {
	repairStories: () => void;
}

export function useRepair(): UseRepairProps {
	const {dispatch} = useStoriesContext();
	const {prefs} = usePrefsContext();
	const {formats} = useStoryFormatsContext();
	const defaultFormat = formatWithNameAndVersion(
		formats,
		prefs.storyFormat.name,
		prefs.storyFormat.version
	);

	return {
		repairStories: React.useCallback(() => {
			dispatch({
				type: 'repair',
				allFormats: formats,
				defaultFormat: defaultFormat
			});
		}, [dispatch, defaultFormat, formats])
	};
}

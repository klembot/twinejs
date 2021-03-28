// Functions to publish stories from context. As little logic as possible should
// live here--instead it should be in util/publish.ts.

import * as React from 'react';
import {
	publishArchive,
	publishStoryWithFormat,
	PublishOptions
} from '../util/publish';
import {usePrefsContext} from './prefs';
import {
	formatWithNameAndVersion,
	loadFormatProperties,
	useStoryFormatsContext
} from './story-formats';
import {storyWithId, useStoriesContext} from './stories';
import {getAppInfo} from '../util/app-info';

export interface UsePublishingProps {
	proofStory: (storyId: string) => Promise<string>;
	publishArchive: () => Promise<string>;
	publishStory: (
		storyId: string,
		publishOptions?: PublishOptions
	) => Promise<string>;
}

export function usePublishing(): UsePublishingProps {
	const {prefs} = usePrefsContext();
	const {dispatch: storyFormatsDispatch, formats} = useStoryFormatsContext();
	const {stories} = useStoriesContext();

	return {
		publishArchive: React.useCallback(
			async () => publishArchive(stories, getAppInfo()),
			[stories]
		),
		proofStory: React.useCallback(
			async storyId => {
				const story = storyWithId(stories, storyId);
				const format = formatWithNameAndVersion(
					formats,
					prefs.proofingFormat.name,
					prefs.proofingFormat.version
				);
				const formatProperties = await loadFormatProperties(
					storyFormatsDispatch,
					format
				);

				return publishStoryWithFormat(
					story,
					formatProperties.source,
					getAppInfo()
				);
			},
			[
				formats,
				prefs.proofingFormat.name,
				prefs.proofingFormat.version,
				stories,
				storyFormatsDispatch
			]
		),
		publishStory: React.useCallback(
			async (storyId, publishOptions) => {
				const story = storyWithId(stories, storyId);
				const format = formatWithNameAndVersion(
					formats,
					story.storyFormat,
					story.storyFormatVersion
				);
				const formatProperties = await loadFormatProperties(
					storyFormatsDispatch,
					format
				);

				return publishStoryWithFormat(
					story,
					formatProperties.source,
					getAppInfo(),
					publishOptions
				);
			},
			[formats, stories, storyFormatsDispatch]
		)
	};
}

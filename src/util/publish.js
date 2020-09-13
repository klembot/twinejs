/*
Functions that publish passages and stories to HTML. These work only with
strings directly, and intentionally do not know anything about the Vuex store.
*/

import escape from 'lodash.escape';
import {t} from './i18n';

export function archiveFilename() {
	const timestamp = new Date().toLocaleString().replace(/[/:\\]/g, '.');

	return t('store.archiveFilename', {timestamp});
}

/* Publishes an archive of stories. */

export function publishArchive(stories, appInfo) {
	return stories.reduce((output, story) => {
		/* Force publishing even if there is no start point set. */

		return (
			output + publishStory(story, appInfo, {startOptional: true}) + '\n\n'
		);
	}, '');
}

/*
Publishes a passage to an HTML fragment. This takes a id argument because
passages are numbered sequentially in published stories, not with a UUID.
*/

export function publishPassage(passage, localId) {
	return (
		`<tw-passagedata pid="${escape(localId)}" ` +
		`name="${escape(passage.name)}" ` +
		`tags="${escape(passage.tags.join(' '))}" ` +
		`position="${passage.left},${passage.top}" ` +
		`size="${passage.width},${passage.height}">` +
		`${escape(passage.text)}</tw-passagedata>`
	);
}

/*
Does a "naked" publish of a story -- creating an HTML representation of it,
but without any story format binding.
*/

export function publishStory(
	story,
	appInfo,
	{formatOptions, startId, startOptional} = {}
) {
	startId = startId || story.startPassage;

	/* Verify that the start passage exists. */

	if (!startOptional) {
		if (!startId) {
			throw new Error(
				'There is no starting point set for this story and none was set manually.'
			);
		}

		if (!story.passages.find(p => p.id === startId)) {
			throw new Error(
				'The passage set as starting point for this story does not exist.'
			);
		}
	}

	/* The id of the start passage as it is published (*not* a UUID). */

	let startLocalId;
	let passageData = '';

	story.passages.forEach((p, index) => {
		passageData += publishPassage(p, index + 1);

		if (p.id === startId) {
			startLocalId = index + 1;
		}
	});

	// FIXME should be reduce, I think

	const tagData = Object.keys(story.tagColors).map(
		tag =>
			`<tw-tag name="${escape(tag)}" color="${escape(
				story.tagColors[tag]
			)}"></tw-tag>`
	);

	return (
		`<tw-storydata name="${escape(story.name)}" ` +
		`startnode="${startLocalId || ''}" ` +
		`creator="${escape(appInfo.name)}" ` +
		`creator-version="${escape(appInfo.version)}" ` +
		`ifid="${escape(story.ifid)}" ` +
		`zoom="${escape(story.zoom)}" ` +
		`format="${escape(story.storyFormat)}" ` +
		`format-version="${escape(story.storyFormatVersion)}" ` +
		`options="${escape(formatOptions)}" hidden>` +
		`<style role="stylesheet" id="twine-user-stylesheet" ` +
		`type="text/twine-css">` +
		story.stylesheet +
		`</style>` +
		`<script role="script" id="twine-user-script" ` +
		`type="text/twine-javascript">` +
		story.script +
		`</script>` +
		tagData +
		passageData +
		`</tw-storydata>`
	);
}

/*
Publishes a story with story format source.
*/

export function publishStoryWithFormat(
	story,
	formatSource,
	appInfo,
	{formatOptions, startId} = {}
) {
	let output = formatSource;

	/*
	We use function replacements to protect the data from accidental
	interactions with the special string replacement patterns.
	*/

	output = output.replace(/{{STORY_NAME}}/g, () => escape(story.name));
	output = output.replace(/{{STORY_DATA}}/g, () =>
		publishStory(story, appInfo, {formatOptions, startId})
	);

	return output;
}

export function storyFilename(story) {
	return `${story.name}.html`;
}

import escape from 'lodash/escape';
import {Passage, Story} from '../store/stories';
import {AppInfo} from './app-info';
import {i18n} from './i18n';

export interface PublishOptions {
	/**
	 * Options that will be passed as-is to the format in the `options` attribute
	 * of the published `<tw-storydata>` tag.
	 */
	formatOptions?: string;

	/**
	 * ID of the passage to start the story at. This overrides what is set at the
	 * story level.
	 */
	startId?: string;

	/**
	 * If true, publishing will proceed even if the story has no starting passage
	 * set and one wasn't set manually.
	 */
	startOptional?: boolean;
}

/**
 * Returns a filename for an archive file.
 */
export function archiveFilename() {
	const timestamp = new Date().toLocaleString().replace(/[/:\\]/g, '.');

	return i18n.t('store.archiveFilename', {timestamp});
}

/**
 * Publishes an archive of stories, e.g. all stories in one file with no story
 * format binding.
 */
export function publishArchive(stories: Story[], appInfo: AppInfo) {
	return stories.reduce((output, story) => {
		// Force publishing even if there is no start point set.

		return (
			output + publishStory(story, appInfo, {startOptional: true}) + '\n\n'
		);
	}, '');
}

/**
 * Publishes a passage to an HTML fragment. This takes a id argument because
 * passages are numbered sequentially in published stories, not with a UUID.
 */
export function publishPassage(passage: Passage, localId: number) {
	return (
		`<tw-passagedata pid="${escape(localId.toString())}" ` +
		`name="${escape(passage.name)}" ` +
		`tags="${escape(passage.tags.join(' '))}" ` +
		`position="${passage.left},${passage.top}" ` +
		`size="${passage.width},${passage.height}">` +
		`${escape(passage.text)}</tw-passagedata>`
	);
}

/**
 * Does a "naked" publish of a story -- creating an HTML representation of it,
 * but without any story format binding.
 */
export function publishStory(
	story: Story,
	appInfo: AppInfo,
	{formatOptions, startId, startOptional}: PublishOptions = {}
) {
	startId = startId ?? story.startPassage;

	// Verify that the start passage exists.

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

	// The id of the start passage as it is published (*not* a UUID).

	let startLocalId;
	let passageData = '';

	story.passages.forEach((p, index) => {
		passageData += publishPassage(p, index + 1);

		if (p.id === startId) {
			startLocalId = index + 1;
		}
	});

	const tagData = Object.keys(story.tagColors).reduce(
		(result, tag) =>
			result +
			`<tw-tag name="${escape(tag)}" color="${escape(
				story.tagColors[tag]
			)}"></tw-tag>`,
		''
	);

	return (
		`<tw-storydata name="${escape(story.name)}" ` +
		`startnode="${startLocalId || ''}" ` +
		`creator="${escape(appInfo.name)}" ` +
		`creator-version="${escape(appInfo.version)}" ` +
		`format="${escape(story.storyFormat)}" ` +
		`format-version="${escape(story.storyFormatVersion)}" ` +
		`ifid="${escape(story.ifid)}" ` +
		`options="${escape(formatOptions)}" ` +
		`tags="${escape(story.tags.join(' '))}" ` +
		`zoom="${escape(story.zoom.toString())}" hidden>` +
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

/**
 * Publishes a story and binds it to the source of a story format.
 */
export function publishStoryWithFormat(
	story: Story,
	formatSource: string,
	appInfo: AppInfo,
	{formatOptions, startId}: PublishOptions = {}
) {
	if (!formatSource) {
		throw new Error('Story format source cannot be empty.');
	}

	let output = formatSource;

	// We use function replacements to protect the data from accidental
	// interactions with the special string replacement patterns.

	output = output.replace(/{{STORY_NAME}}/g, () => escape(story.name));
	output = output.replace(/{{STORY_DATA}}/g, () =>
		publishStory(story, appInfo, {formatOptions, startId})
	);

	return output;
}

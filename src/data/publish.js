/*
Publishes stories to HTML. This is agnostic about the data storage method, e.g.
these functions know nothing about Vuex. Functions that are Vuex-aware can be
found at ../common/publish.js.
*/

const escape = require('lodash.escape');
const locale = require('../locale');

const publish = module.exports = {
	/*
	Publishes a story with a story format. The format *must* be loaded before
	this function is called.
	*/

	publishStoryWithFormat(appInfo, story, format, formatOptions, startId) {
		if (!format.properties || !format.properties.source) {
			throw new Error('Story format has no source property');
		}

		let output = format.properties.source;

		/*
		We use function replacements to protect the data from accidental
		interactions with the special string replacement patterns.

		First, built-in placeholders.
		*/

		output = output.replace(/{{STORY_NAME}}/g, () => escape(story.name));
		output = output.replace(/{{STORY_DATA}}/g, () => {
			return publish.publishStory(appInfo, story, formatOptions, startId);
		});

		/* Then, format-defined placeholders. */

		if (format.properties.placeholders) {
			format.properties.placeholders.forEach(p => {
				const value = story[p.name];

				if (value !== undefined) {
					output = output.replace(p.name, () => value);
				}
			});
		}

		return output;
	},

	/* Publishes an archive of stories. */

	publishArchive(stories, appInfo) {
		return stories.reduce(
			(output, story) => {
				/* Force publishing even if there is no start point set. */

				return output + publish.publishStory(
					appInfo, story, null, null, true
				) + '\n\n';
			},

			''
		);
	},

	/*
	Does a "naked" publish of a story -- creating an HTML representation of it,
	but without any story format binding.
	*/

	publishStory(appInfo, story, formatOptions, startId, startOptional) {
		startId = startId || story.startPassage;

		/* Verify that the start passage exists. */

		if (!startOptional) {
			if (!startId) {
				throw new Error(locale.say(
					'There is no starting point set for this story.'
				));
			}

			if (!story.passages.find(p => p.id === startId)) {
				throw new Error(locale.say(
					'The passage set as starting point for this story does ' +
					'not exist.'
				));
			}
		};

		/* The id of the start passage as it is published (*not* a UUID). */

		let startLocalId;
		let passageData = '';

		story.passages.forEach((p, index) => {
			passageData += publish.publishPassage(p, index + 1);

			if (p.id === startId) {
				startLocalId = index + 1;
			}
		});

		const tagData = Object.keys(story.tagColors).map(tag =>
			`<tw-tag name="${escape(tag)}" color="${escape(story.tagColors[tag])}"></tw-tag>`
		);

		return `<tw-storydata name="${escape(story.name)}" ` +
			`startnode="${startLocalId || ''}" ` +
			`creator="${escape(appInfo.name)}" ` +
			`creator-version="${escape(appInfo.version)}" ` +
			`ifid="${escape(story.ifid)}" ` +
			`zoom="${escape(story.zoom)}" ` +
			`format="${escape(story.storyFormat)}" ` +
			`format-version="${escape(story.storyFormatVersion)}" ` +
			`options="${escape(formatOptions)}" hidden>` +
			`<style role="stylesheet" id="twine-user-stylesheet" ` +
			`type="text/twine-css">` + story.stylesheet + `</style>` +
			`<script role="script" id="twine-user-script" ` +
			`type="text/twine-javascript">` + story.script + `</script>` +
			tagData + passageData +
			`</tw-storydata>`;
	},

	/*
	Publishes a passage to an HTML fragment. This takes a id argument because
	passages are numbered sequentially in published stories, not with a UUID.
	*/

	publishPassage(passage, localId) {
		return `<tw-passagedata pid="${escape(localId)}" ` +
			`name="${escape(passage.name)}" ` +
			`tags="${escape(passage.tags.join(' '))}" ` +
			`position="${passage.left},${passage.top}" ` +
			`size="${passage.width},${passage.height}">` +
			`${escape(passage.text)}</tw-passagedata>`;
	}
};

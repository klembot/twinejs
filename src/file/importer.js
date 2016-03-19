/**
 Handles importing data stored in HTML format into model objects.
 This works on both published story files and archives.

 @module file/importer
**/

const _ = require('underscore');
const StoryCollection = require('../data/collections/story');
const PassageCollection = require('../data/collections/passage');
const confirm = require('../ui/confirm');
const locale = require('../locale');

const importer = module.exports = {
	/**
	 Imports a file containing either a single published story, or an
	 archive of several stories. The stories are immediately saved to storage.
	 This does not yet work with stories published by Twine 1.x.

	 @module file/importer
	 @param {String} data Contents of the file to be imported.
	 @param {Object} options Object with these optional options:
							 lastUpdate (If passed, overrides the last updated date)
							 confirmReplace (If true, ask to replace same-named stories)
	**/

	import(data, { lastUpdate, confirmReplace }) {
		const sels = importer.selectors;

		// the story and passage containers which are connected to localStorage
		// we need .all() so that we can compare the names of existing stories
		// with those being imported.

		const allStories = StoryCollection.all();
		const allPassages = new PassageCollection();

		// temporary containers for the story and passage attribute objects we will create

		const tempStoryData = [];

		// parse data into a DOM

		let count = 0;
		const nodes = document.createElement('div');

		nodes.innerHTML = data;

		// return a promise representing the import of every story

		return _.reduce(nodes.querySelectorAll(sels.storyData),
				(promise, storyEl) => {
			count += 1;
			const startPassageId = storyEl.attributes.startnode.value;
			const name = storyEl.attributes.name.value;

			function importStory() {

				// glom all style nodes into the stylesheet property

				let stylesheet = '';

				_.each(storyEl.querySelectorAll(sels.stylesheet), el => {
					stylesheet += el.textContent + '\n';
				});

				// likewise for script nodes

				let script = '';

				_.each(storyEl.querySelectorAll(sels.script), el => {
					script += el.textContent + '\n';
				});

				// build a story attribute object, which we will create() en masse later.

				const story = {
					name,
					storyFormat: storyEl.attributes.format.value,
					ifid: (storyEl.attributes.ifid) ?
						storyEl.attributes.ifid.value
						: undefined,
					stylesheet: stylesheet || undefined,
					script: script || undefined,
					// override update date if requested
					lastUpdate: lastUpdate || undefined
				};

				// and an array of attribute objects for child passages

				let startPassage;

				const passages = _.map(
					storyEl.querySelectorAll(sels.passageData),
					passageEl => {
						const pid = passageEl.attributes.pid.value;
						const pos = passageEl.attributes.position.value;
						const [left, top] = pos.split(',').map(Math.floor);
						let tags = passageEl.attributes.tags.value;

						const passage = {
							name: passageEl.attributes.name.value,
							tags: (tags === '') ? [] : tags.split(/\s+/),
							text: passageEl.textContent,
							left,
							top
						};

						// note if this is the start passage

						if (pid === startPassageId) {
							startPassage = passage;
						}
						return passage;

					});

				// store these objects together, though they'll be added to different
				// collections.

				tempStoryData.push({story, passages, startPassage});
			}

			// notice this outer promise has no .catch() handler - the consumer of
			// import() may attach one as they wish.

			return promise.then(() => {

				// ask to replace the story if it exists;
				// this is the async step which requires promises

				const existing = allStories.findWhere({name});

				if (confirmReplace && existing) {

					// reminder: returning this confirm() promise will halt the
					// promise chain until the dialog is closed.

					return confirm({
						message:

							// TODO: provide more details, such as each story's modified
							// date, number of passages (which we'd have to calculate), etc.

							locale.say(
								'A story named "%s" already exists. '
								+ 'Replace it with the imported story?',
								_.escape(name)),
						buttonLabel:
							locale.say('Replace')
					})
					.then(

						// remove the existing story and import the story
						// if confirm was selected, otherwise do nothing (drop the
						// promise's rejection).

						() => {
							existing.destroy({ wait: true });
							importStory();
						},
						() => {}
					);
				}
				else {
					importStory();
				}
			});
		}, Promise.resolve())

		// This final task creates all of the story and passage models
		// from the retrieved data.

		.then(() => {

			tempStoryData.forEach(({story, passages, startPassage}) => {

				// create the story models

				const storyModel = allStories.create(story, {
					wait: true, silent: true, validate: false
				});

				// create each passage model

				passages.forEach(passage => {

					// add the id of its parent story

					passage.story = storyModel.id;

					// create the model

					const passageModel = allPassages.create(passage, {
						wait: true, silent: true, validate: false
					});

					// if this is a start passage, add the model id
					// of this passage to the story.

					if (passage === startPassage) {
						storyModel.save({ startPassage: passageModel.id }, { wait: true });
					}
				});
			});

			// return the number of stories that were found, as well as added
			return { count, added: tempStoryData.length };
		});

	},

	/**
	 A static namespace of DOM selectors for published HTML elements.
	 This is aligned with utils/selectors.js in Harlowe.
	
	 @property selectors
	 @type Object
	 @final
	**/

	selectors: {
		passage: 'tw-passage',
		story: 'tw-story',
		script: '[role=script]',
		stylesheet: '[role=stylesheet]',
		storyData: 'tw-storydata',
		passageData: 'tw-passagedata'
	}
};

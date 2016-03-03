/**
 Handles importing data stored in HTML format into model objects.
 This works on both published story files and archives.

 @module file/importer
**/

const _ = require('underscore');
const StoryCollection = require('../data/collections/story');
const PassageCollection = require('../data/collections/passage');

const importer = module.exports = {
	/**
	 Imports a file containing either a single published story, or an
	 archive of several stories. The stories are immediately saved to storage.
	 This does not yet work with stories published by Twine 1.x.

	 @module file/importer
	 @param {String} data Contents of the file to be imported.
	 @param {Date} lastUpdate If passed, overrides the last updated date of the
		 stories.
	**/

	import(data, lastUpdate) {
		const sels = importer.selectors;

		// containers for the new stories and passages we will create

		const allStories = new StoryCollection();
		const allPassages = new PassageCollection();

		// parse data into a DOM

		let count = 0;
		const nodes = document.createElement('div');

		nodes.innerHTML = data;

		// remove surrounding <body>, if there is one

		_.each(nodes.querySelectorAll(sels.storyData), storyEl => {
			const startPassageId = storyEl.attributes.startnode.value;

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

			// create a story object

			const story = allStories.create({
				name: storyEl.attributes.name.value,
				storyFormat: storyEl.attributes.format.value,
				ifid: (storyEl.attributes.ifid) ?
					storyEl.attributes.ifid.value
					: undefined,
				stylesheet: (stylesheet !== '') ? stylesheet : undefined,
				script: (script !== '') ? script : undefined
			}, { wait: true, silent: true, validate: false });

			// and child passages

			_.each(
				storyEl.querySelectorAll(sels.passageData),
				passageEl => {
					const id = passageEl.attributes.pid.value;
					const pos = passageEl.attributes.position.value;
					const posBits = pos.split(',');
					let tags = passageEl.attributes.tags.value;

					tags = (tags === '') ? [] : tags.split(/\s+/);

					const passage = allPassages.create(
						{
							name: passageEl.attributes.name.value,
							tags,
							text: passageEl.textContent,
							story: story.id,
							left: parseInt(posBits[0]),
							top: parseInt(posBits[1])
						},
						{ wait: true, silent: true, validate: false }
					);

					if (id == startPassageId) {
						story.save(
							{ startPassage: passage.id },
							{ silent: true, validate: false }
						);
					}
				});
			
			// override update date if requested
			
			if (lastUpdate) {
				story.save(
					{ lastUpdate },
					{ silent: true, validate: false }
				);
			}

			count++;
		});

		return count;
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

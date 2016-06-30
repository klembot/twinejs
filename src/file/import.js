// Handles importing data stored in HTML format into model objects. This works
// on both published story files and archives.
//
// It's important that this code be as efficient as possible, as it directly
// affects startup time in the Twine desktop app. This module moves data from
// the filesystem into local storage, and the app can't begin until it's done.

const ChooseImportReplaceDialog = require('../dialogs/choose-import-replace');
const locale = require('../locale');
const notify = require('../ui/notify');

// HTML selectors used to find data in HTML format.

const selectors =  {
	passage: 'tw-passage',
	story: 'tw-story',
	script: '[role=script]',
	stylesheet: '[role=stylesheet]',
	storyData: 'tw-storydata',
	passageData: 'tw-passagedata'
};

// Converts a DOM <tw-storydata> element to an object with two properties:
// story, with properties for a given story, and passages, an array of
// properties. nb. This returns plain JavaScript objects, *not* Backbone
// models, for efficiency's sake.

function domToIntermediate(storyEl, forceLastUpdate) {
	return {
		story: {
			// Important: this is the passage's pid (a one-off id created at
			// publish time), *not* a database id.

			startPassagePid:
				storyEl.attributes.startnode.value,
			name:
				storyEl.attributes.name.value,
			ifid:
				storyEl.attributes.ifid.value,
			lastUpdate:
				forceLastUpdate,
			script:
				Array.from(storyEl.querySelectorAll(selectors.script))
					.reduce(
						(src, el) => src + `${el.textContent}\n`,
						''
					),
			stylesheet:
				Array.from(storyEl.querySelectorAll(selectors.stylesheet))
					.reduce(
						(src, el) => { return src + `${el.textContent}\n`; },
						(src, el) => src + `${el.textContent}\n`,
						''
					)
		},

		passages: Array.from(
			storyEl.querySelectorAll(selectors.passageData)
		).map(passageEl => {
			const pos = passageEl.attributes.position.value
				.split(',')
				.map(Math.floor);

			return {
				// Again, a one-off id, not a database id.

				pid:
					passageEl.attributes.pid.value,
				left:
					pos[0],
				top:
					pos[1],
				tags:
					passageEl.attributes.tags.value.split(/\s+/),
				text:
					passageEl.textContent
			};
		})
	};
}

// Saves a single intermediate representation created by the above
// domToIntermediate function to the database by creating Backbone models.
// The reason why we break it into two steps is to allow the potential for
// the user to confirm replacing existing stories.
//
// If any story exists in the collection with the same name as one being saved,
// it will be deleted.
//
// This returns the parent story model that was created.

function saveIntermediate(data, storyCollection, passageCollection) {
	// Options to get data into local storage as quickly as possible.

	const saveOptions = { wait: true, silent: true, validate: false };

	// Delete existing.

	const oldStory = storyCollection.find({ name: data.story.name });

	if (oldStory) {
		oldStory.destroy({ wait: true, silent: true });
	}

	// We can't pass data straight to the model because it has extraneous
	// attributes, e.g. startPassagePid and pid.
	//
	// We have to initially save the story, then save it again at the bottom so
	// that we have a parent ID to work with.

	let storyModel = storyCollection.create(
		{
			name: data.story.name,
			ifid: data.story.ifid,
			lastUpdate: data.story.lastUpdate,
			script: data.story.script,
			stylesheet: data.story.stylesheet
		},
		saveOptions
	);

	data.passages.forEach(passage => {
		let passageModel = passageCollection.create(
			{
				story: storyModel.id,
				left: passage.left,
				top: passage.top,
				tags: passage.tags,
				text: passage.text
			},
			saveOptions
		);

		if (passage.pid === data.story.startPassagePid) {
			storyModel.set({ startPassage: passageModel.id });
		}
	});

	storyModel.save(saveOptions);
	return storyModel;
}

const fileImport = module.exports = {
	// Begins an import operation of HTML source code. lastUpdate forces created
	// items to have a particular lastUpdate date/time; if confirmReplace is
	// true, then a dialog will open that allows the user to decide what stories
	// to replace.
	//
	// This returns a promise that resolves to an array of story Backbone models
	// that were imported.

	importData(data, { lastUpdate, confirmReplace, silent,
		storyCollection, passageCollection }) {
		// The story and passage containers which are connected to localStorage.
		// We need .all() so that we can compare the names of existing stories
		// with those being imported.

		storyCollection = storyCollection || StoryCollection.all();
		passageCollection = passageCollection || new PassageCollection();

		// Turn the raw source into a DOM tree, then into an intermediate
		// representation (e.g. plain JavaScript objects).

		const nodes = document.createElement('div');

		nodes.innerHTML = data;

		let intermediate = Array.from(
			nodes.querySelectorAll(selectors.storyData)
		)
		.map(storyEl => domToIntermediate(storyEl, lastUpdate));

		const storyNames = intermediate.map(data => data.story.name);
		let result;

		if (confirmReplace) {
			// If we are confirming the replacement of existing stories, we
			// use that dialog's promise as a base for the actual import.
			
			const existing = storyCollection.reduce(
				(dupes, item) => {
					if (storyNames.indexOf(item.get('name') !== -1)) {
						dupes.push(item.get('name'));
					}

					return dupes;
				},

				[]
			);

			if (existing.length > 0) {
				result = new ChooseImportReplaceDialog({
					data: { names: existing }
				});

				result.$mountTo(document.body);

				// This will resolve to an array of names of stories *to*
				// replace. We prune down the intermediate data list
				// accordingly.

				result.then(toReplace => {
					intermediate = intermediate.filter(data => {
						return toReplace.indexOf(data.story.name) !== -1 ||
							existing.indexOf(data.story.name) === -1;
					});
				});
			}
		}

		// Although we don't need to be asynchronous, we create a promise here
		// to match what happens if a confirmation is needed.

		result = result || Promise.resolve();

		return result.then(() => new Promise(resolve => {
			const stories = intermediate.map(
				data => saveIntermediate(
					data, storyCollection, passageCollection
				)
			);

			// Notify the user that the import was successful and resolve the
			// promise.

			if (!silent) {
				let className = '';
				let message = '';

				if (stories.length === 0) {
					className = 'danger';
					message = locale.say(
						'Sorry, no stories could be found in this file.'
					);
				}
				else {
					// L10n: %d is a number of stories.
					message = locale.sayPlural(
						'%d story was imported.',
						'%d stories were imported.',
						stories.length
					);
				}

				notify(message, className);
			}
			
			resolve(stories);
		}))
		.catch(err => {
			if (err !== 'User cancelled importing') {
				notify(
					'An error occurred while trying to import this file. (' +
						err.message + ')',
					'danger'
				);
			}
		});
	},

	// Begins an import based on an item in a FileList.
	//
	// This returns a promise that resolves to the array of Story models that
	// were imported.

	importFile(file, options) {
		return new Promise(resolve => {
			const reader = new FileReader();

			reader.addEventListener('load', e => {
				resolve(
					fileImport.importData(e.target.result, options)
				);
			});

			reader.readAsText(file, 'UTF-8');
		});
	}
};

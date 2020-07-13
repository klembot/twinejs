/*
Persists data to the file system. This can only be used when running in an
Electron context (see src/electron/is-electron.js for how to detect that).
*/

const {createFormat} = require('../actions/story-format');
const {setPref} = require('../actions/pref');
const {importStory} = require('../actions/story');
const {loadFormat} = require('../actions/story-format');
const importFile = require('../import');

/* These are exposed to us by the Electron preload script. */

const {ipcRenderer} = window.twineElectron;

let previousStories;

function updatePrevious(state) {
	/*
	Do a quasi-deep clone-- we need to peel off the top-level properties like
	name, but passages don't matter to us.
	*/

	previousStories = state.story.stories.map(s => Object.assign({}, s));
}

function saveStory(store, state, story) {
	loadFormat(store, story.storyFormat, story.storyFormatVersion).then(
		format => {
			ipcRenderer.send('save-story', story, format, state.appInfo);
		}
	);
}

function saveJson(filename, data) {
	ipcRenderer.send('save-json', filename, data);
}

module.exports = store => {
	updatePrevious(store.state);

	/*
	Initialize the store with data previously loaded in src/electron/index.js.
	*/

	const hydrate = window.twineElectron.hydrate;

	if (hydrate.initialStoryData) {
		hydrate.initialStoryData.forEach(story => {
			const storyData = importFile(story.data, story.mtime);

			if (storyData.length > 0) {
				importStory(store, storyData[0]);
			}
		});
	}

	if (hydrate.prefs) {
		Object.keys(hydrate.prefs).forEach(key =>
			setPref(store, key, hydrate.prefs[key])
		);
	}

	if (hydrate.storyFormats) {
		Object.keys(hydrate.storyFormats).forEach(key =>
			createFormat(store, hydrate.storyFormats[key])
		);
	}

	/*
	Save stories as they are created and edited.
	*/

	store.subscribe((mutation, state) => {
		switch (mutation.type) {
			case 'CREATE_STORY':
			case 'IMPORT_STORY':
				saveStory(
					store,
					state,
					state.story.stories.find(
						s => s.name === mutation.payload[0].name
					)
				);
				break;

			case 'DUPLICATE_STORY':
				saveStory(
					store,
					state,
					state.story.stories.find(
						s => s.name === mutation.payload[1].name
					)
				);
				break;

			case 'UPDATE_STORY':
				if (mutation.payload[1].name) {
					/*
					The story has been renamed, and we need to process it
					specially. We rename the story file, then save it to catch
					any other changes.
					*/

					const oldStory = previousStories.find(
						s => s.id === mutation.payload[0]
					);
					const newStory = state.story.stories.find(
						s => s.id === mutation.payload[0]
					);

					function afterRename(_sender) {
						saveStory(store, state, newStory)
					}

					ipcRenderer.once('story-renamed', afterRename);
					ipcRenderer.send('rename-story', oldStory, newStory);
				} else {
					saveStory(
						store,
						state,
						state.story.stories.find(
							s => s.id === mutation.payload[0]
						)
					);
				}
				break;

			case 'DELETE_STORY':
				/*
				We have to use our last copy of the stories array, because
				by now the deleted story is gone from the state.
				*/

				const toDelete = previousStories.find(
					s => s.id === mutation.payload[0]
				);

				if (toDelete) {
					ipcRenderer.send('delete-story', toDelete);
				}
				break;

			case 'CREATE_PASSAGE_IN_STORY':
			case 'DELETE_PASSAGE_IN_STORY':
				saveStory(
					store,
					state,
					state.story.stories.find(s => s.id === mutation.payload[0])
				);
				break;

			case 'UPDATE_PASSAGE_IN_STORY': {
				/* Is this a significant update? */

				if (
					Object.keys(mutation.payload[2]).some(
						key => key !== 'selected'
					)
				) {
					saveStory(
						store,
						state,
						state.story.stories.find(
							s => s.id === mutation.payload[0]
						)
					);
				}
				break;
			}

			case 'UPDATE_PREF':
				saveJson('prefs.json', state.pref);
				break;

			case 'CREATE_FORMAT':
			case 'UPDATE_FORMAT':
			case 'DELETE_FORMAT':
				/*
				state.storyFormats.formats is likely to contain the actual story
				format data, and possibly other extraneous stuff. We don't want
				to serialize that.
				*/

				const toSave = {};

				Object.keys(state.storyFormat.formats).forEach(i => {
					toSave[i] = {
						id: state.storyFormat.formats[i].id,
						name: state.storyFormat.formats[i].name,
						version: state.storyFormat.formats[i].version,
						url: state.storyFormat.formats[i].url,
						userAdded: state.storyFormat.formats[i].userAdded
					};
				});

				saveJson('story-formats.json', toSave);
				break;

			case 'LOAD_FORMAT':
				/* This change doesn't need to be persisted. */
				break;

			default:
				throw new Error(
					`Don't know how to handle mutation ${mutation.type}`
				);
		}

		/*
		We save a copy of the stories structure in aid of deleting and renaming,
		as above.
		*/

		updatePrevious(state);
	});
};

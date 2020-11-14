/*
Loads and persists data using Electron IPC calls to the main process, which are
set up by modules under src/electron. This can only be used when running in an
Electron context--see src/util/is-electron.js for how to detect that.
*/

import {importStories} from '@/util/import';

let previousStories;

function updatePrevious(state) {
	/*
	Do a quasi-deep clone-- we need to peel off the top-level properties like
	name, but passages don't matter to us.
	*/

	previousStories = state.story.stories.map(s => ({...s}));
}

function saveStory(store, story) {
	const {ipcRenderer} = window.twineElectron;

	const format = store.state.storyFormat.formats.find(
		f => f.name === story.storyFormat && f.version === story.storyFormatVersion
	);

	/* It's OK if format lookup fails. The main process will save it as naked story data. */

	ipcRenderer.send('save-story', story, format, store.state.appInfo);
}

function saveJson(filename, data) {
	const {ipcRenderer} = window.twineElectron;

	ipcRenderer.send('save-json', filename, data);
}

export default store => {
	if (!window.twineElectron) {
		throw new Error(
			'Required Electron hooks are not present in global environment'
		);
	}

	const {ipcRenderer} = window.twineElectron;

	updatePrevious(store.state);

	/*
	Initialize the store with data previously loaded by the main process. Note
	that we add subscription on some of these mutations after all this is done.
	*/

	const {hydrate} = window.twineElectron;

	if (hydrate.stories) {
		hydrate.stories.forEach(storyFile => {
			try {
				const stories = importStories(storyFile.data, storyFile.mtime);

				stories.forEach(story => {
					store.dispatch('story/createStory', {storyProps: story});
				});
			} catch (e) {
				/* Keep going--the alternative is to crash. */

				console.warn(`Could not load story from hydrated HTML: ${e}`);
			}
		});
	}

	if (hydrate.prefs) {
		store.dispatch('pref/update', hydrate.prefs);
	}

	if (hydrate.storyFormats) {
		Object.keys(hydrate.storyFormats).forEach(key =>
			store.dispatch('storyFormat/createFormat', hydrate.storyFormats[key])
		);
	}

	/*
	Save stories as they are created and edited.
	*/

	store.subscribe((mutation, state) => {
		switch (mutation.type) {
			case 'story/createStory':
				saveStory(
					store,
					state.story.stories.find(
						s => s.name === mutation.payload.storyProps.name
					)
				);
				break;

			case 'story/updateStory':
				if (mutation.payload.storyProps.name) {
					/*
					The story has been renamed, and we need to process it
					specially. We rename the story file, then save it to catch
					any other changes.
					*/

					const oldStory = previousStories.find(
						s => s.id === mutation.payload.storyId
					);
					const newStory = state.story.stories.find(
						s => s.id === mutation.payload.storyId
					);

					ipcRenderer.once('story-renamed', () => saveStory(store, newStory));
					ipcRenderer.send('rename-story', oldStory, newStory);
				} else {
					saveStory(
						store,
						state.story.stories.find(s => s.id === mutation.payload.storyId)
					);
				}
				break;

			case 'story/deleteStory': {
				/*
				We have to use our last copy of the stories array, because
				by now the deleted story is gone from the state.
				*/

				const toDelete = previousStories.find(
					s => s.id === mutation.payload.storyId
				);

				if (toDelete) {
					ipcRenderer.send(
						'delete-story',
						previousStories.find(s => s.id === mutation.payload.storyId)
					);
				}
				break;
			}

			case 'story/createPassage':
			case 'story/deletePassage':
				saveStory(
					store,
					state.story.stories.find(s => s.id === mutation.payload.storyId)
				);
				break;

			case 'story/updatePassage': {
				/* Is this a significant update? */

				if (
					Object.keys(mutation.payload.passageProps).some(
						key => key !== 'selected'
					)
				) {
					saveStory(
						store,
						state.story.stories.find(s => s.id === mutation.payload.storyId)
					);
				}
				break;
			}

			case 'pref/update':
				saveJson('prefs.json', state.pref);
				break;

			case 'storyFormat/createFormat':
			case 'storyFormat/deleteFormat': {
				/*
				state.storyFormats.formats is likely to contain the actual story
				format data, and possibly other extraneous stuff. We don't want
				to serialize that.
				*/

				saveJson(
					'story-formats.json',
					state.storyFormat.formats.map(format => ({
						id: format.id,
						name: format.name,
						version: format.version,
						url: format.url,
						userAdded: format.userAdded
					}))
				);
				break;
			}

			case 'storyFormat/updateFormat':
			case 'storyFormat/setAddFormatError':
				/* These changes don't need to be persisted. */
				break;

			default:
				throw new Error(`Don't know how to handle mutation ${mutation.type}`);
		}

		/*
		We save a copy of the stories structure in aid of deleting and renaming,
		as above.
		*/

		updatePrevious(state);
	});
};

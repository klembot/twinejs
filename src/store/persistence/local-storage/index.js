/*
This emulates the persistence strategy used by Backbone's local storage adapter
as a Vuex middleware. This uses this basic pattern:

twine-[datakey]: a comma separated list of IDs
twine-[datakey]-[uuid]: JSON formatted data for that object

This pattern is emulated, even with structures (like prefs) that don't need
this, for compatibility.
*/

import {load as loadPref, save as savePref} from './pref';
import {
	deletePassage,
	deletePassageById,
	deleteStory,
	load as loadStory,
	savePassage,
	saveStory,
	update as updateStories
} from './story';
import {load as loadStoryFormat, save as saveStoryFormat} from './story-format';

let enabled = true;
let previousStories;

export default store => {
	enabled = false;
	loadPref(store);
	loadStory(store);
	loadStoryFormat(store);
	previousStories = store.state.story.stories;
	enabled = true;

	store.subscribe((mutation, state) => {
		if (!enabled) {
			return;
		}

		console.log('local storage listener', mutation);

		switch (mutation.type) {
			case 'story/createStory':
				updateStories(transaction => {
					saveStory(
						transaction,
						state.story.stories.find(s => s.name === mutation.payload[0].name)
					);
				});
				break;

			case 'story/updateStory':
				updateStories(transaction => {
					saveStory(
						transaction,
						state.story.stories.find(s => s.id === mutation.payload[0])
					);
				});
				break;

			case 'DUPLICATE_STORY__FIXME':
				updateStories(transaction => {
					const dupe = state.story.stories.find(
						s => s.name === mutation.payload[1]
					);

					saveStory(transaction, dupe);
					dupe.passages.forEach(passage => savePassage(transaction, passage));
				});
				break;

			case 'IMPORT_STORY__FIXME':
				updateStories(transaction => {
					const imported = state.story.stories.find(
						s => s.name === mutation.payload[0].name
					);

					saveStory(transaction, imported);
					imported.passages.forEach(passage =>
						savePassage(transaction, passage)
					);
				});
				break;

			case 'story/deleteStory': {
				/*
				We have to use our last copy of the stories array, because
				by now the deleted story is gone from the state.
				*/

				const toDelete = previousStories.find(
					s => s.id === mutation.payload[0]
				);

				updateStories(transaction => {
					/*
					It's our responsibility to delete child passages first.
					*/

					toDelete.passages.forEach(passage =>
						deletePassage(transaction, passage)
					);
					deleteStory(transaction, toDelete);
				});
				break;
			}

			/*
			When saving a passage, we have to make sure to save its parent
			story too, since its lastUpdate property has changed.
			*/

			case 'story/createPassage': {
				const parentStory = state.story.stories.find(
					s => s.id === mutation.payload[0]
				);
				const passage = parentStory.passages.find(
					p => p.name === mutation.payload[1].name
				);

				updateStories(transaction => {
					saveStory(transaction, parentStory);
					savePassage(transaction, passage);
				});
				break;
			}

			case 'story/updatePassage': {
				/* Is this a significant update? */

				if (Object.keys(mutation.payload[2]).some(key => key !== 'selected')) {
					const parentStory = state.story.stories.find(
						s => s.id === mutation.payload[0]
					);
					const passage = parentStory.passages.find(
						p => p.id === mutation.payload[1]
					);

					updateStories(transaction => {
						saveStory(transaction, parentStory);
						savePassage(transaction, passage);
					});
				}
				break;
			}

			case 'story/deletePassage': {
				const parentStory = state.story.stories.find(
					s => s.id === mutation.payload[0]
				);

				/*
				We can't dig up the passage in question right now, because
				previousStories is only a shallow copy, and it's gone there at
				this point in time.
				*/

				updateStories(transaction => {
					saveStory(transaction, parentStory);
					deletePassageById(transaction, mutation.payload[1]);
				});
				break;
			}

			case 'pref/update':
				savePref(store);
				break;

			case 'storyFormat/create':
			case 'storyFormat/update':
			case 'storyFormat/delete':
				saveStoryFormat(store);
				break;

			case 'LOAD_FORMAT__FIXME':
				/* This change doesn't need to be persisted. */
				break;

			default:
				throw new Error(`Don't know how to handle mutation ${mutation.type}`);
		}

		/*
		We save a copy of the stories structure in aid of deleting, as above.
		*/

		previousStories = state.story.stories;
	});
};

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

		/*
		Because we're operating globally, mutation types are namespaced.
		*/

		switch (mutation.type) {
			case 'story/createStory':
				updateStories(transaction => {
					/*
					The newly-created story may have passages with it if it was created
					through an import.
					*/

					const story = state.story.stories.find(
						s => s.name === mutation.payload.storyProps.name
					);

					if (!story) {
						throw new Error(
							`Couldn't find a story with name "${mutation.payload.storyProps.name}"`
						);
					}

					saveStory(transaction, story);
					story.passages.forEach(passage => savePassage(transaction, passage));
				});
				break;

			case 'story/updateStory':
				updateStories(transaction => {
					const story = state.story.stories.find(
						s => s.id === mutation.payload.storyId
					);

					if (!story) {
						throw new Error(
							`Couldn't find a story with ID "${mutation.payload.storyId}"`
						);
					}

					saveStory(transaction, story);

					/*
					Sync up passages. If this proves to be sluggish, we may need to cache
					passages and only save when they are updated.
					*/

					story.passages.forEach(passage => savePassage(transaction, passage));
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

			case 'story/deleteStory': {
				/*
				We have to use our last copy of the stories array, because
				by now the deleted story is gone from the state.
				*/

				const toDelete = previousStories.find(
					s => s.id === mutation.payload.storyId
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
					s => s.id === mutation.payload.storyId
				);

				if (!parentStory) {
					throw new Error(
						`There is no story with ID "${mutation.payload.storyId}".`
					);
				}

				if (!mutation.payload.passageProps.name) {
					throw new Error(
						`Can't save a passage because it has no name property.`
					);
				}

				const passage = parentStory.passages.find(
					p => p.name === mutation.payload.passageProps.name
				);

				if (!passage) {
					throw new Error(
						`There is no passage with name "${mutation.payload.passageProps.name}" in story ID ${parentStory.id}.`
					);
				}

				updateStories(transaction => {
					saveStory(transaction, parentStory);
					savePassage(transaction, passage);
				});
				break;
			}

			case 'story/updatePassage': {
				/* Is this a significant update? */

				if (
					Object.keys(mutation.payload.passageProps).some(
						key => key !== 'selected'
					)
				) {
					const parentStory = state.story.stories.find(
						s => s.id === mutation.payload.storyId
					);

					if (!parentStory) {
						throw new Error(
							`There is no story with ID "${mutation.payload.storyId}".`
						);
					}

					const passage = parentStory.passages.find(
						p => p.id === mutation.payload.passageId
					);

					if (!passage) {
						throw new Error(
							`There is no passage with ID "${mutation.payload.passageId}" in story ID "${mutation.payload.storyId}"`
						);
					}

					updateStories(transaction => {
						saveStory(transaction, parentStory);
						savePassage(transaction, passage);
					});
				}
				break;
			}

			case 'story/deletePassage': {
				const parentStory = state.story.stories.find(
					s => s.id === mutation.payload.storyId
				);

				/*
				We can't dig up the passage in question right now, because
				previousStories is only a shallow copy, and it's gone there at
				this point in time.
				*/

				updateStories(transaction => {
					saveStory(transaction, parentStory);
					deletePassageById(transaction, mutation.payload.passageId);
				});
				break;
			}

			case 'pref/update':
				savePref(store);
				break;

			case 'storyFormat/createFormat':
			case 'storyFormat/updateFormat':
			case 'storyFormat/deleteFormat':
				saveStoryFormat(store);
				break;

			case 'storyFormat/loadFormat':
			case 'storyFormat/setAddFormatError':
			case 'storyFormat/setFormatProperties':
				/* These changes doesn't need to be persisted. */
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

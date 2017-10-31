/*
This emulates the persistence strategy used by Backbone's local storage adapter
as a Vuex middleware. This uses this basic pattern:

twine-[datakey]: a comma separated list of IDs
twine-[datakey]-[uuid]: JSON formatted data for that object

This pattern is emulated, even with structures (like prefs) that don't need
this, for compatibility.
*/

const pref = require('./pref');
const story = require('./story');
const storyFormat = require('./story-format');

let enabled = true;
let previousStories;

module.exports = store => {
	enabled = false;
	pref.load(store);
	story.load(store);
	storyFormat.load(store);
	previousStories = store.state.story.stories;
	enabled = true;

	store.subscribe((mutation, state) => {
		if (!enabled) {
			return;
		}

		switch (mutation.type) {
			case 'CREATE_STORY':
				story.update(transaction => {
					story.saveStory(
						transaction,
						state.story.stories.find(
							s => s.name === mutation.payload[0].name
						)
					);
				});
				break;

			case 'UPDATE_STORY':
				story.update(transaction => {
					story.saveStory(
						transaction,
						state.story.stories.find(
							s => s.id === mutation.payload[0]
						)
					);
				});
				break;

			case 'DUPLICATE_STORY':
				story.update(transaction => {
					const dupe = state.story.stories.find(
						s => s.name === mutation.payload[1]
					);

					story.saveStory(transaction, dupe);

					dupe.passages.forEach(
						passage => story.savePassage(transaction, passage)
					);
				});
				break;

			case 'IMPORT_STORY':
				story.update(transaction => {
					const imported = state.story.stories.find(
						s => s.name === mutation.payload[0].name
					);

					story.saveStory(transaction, imported);

					imported.passages.forEach(
						passage => story.savePassage(transaction, passage)
					);
				});
				break;

			case 'DELETE_STORY': {
				/*
				We have to use our last copy of the stories array, because
				by now the deleted story is gone from the state.
				*/

				const toDelete = previousStories.find(
					s => s.id === mutation.payload[0]
				);

				story.update(transaction => {
					/*
					It's our responsibility to delete child passages first.
					*/

					toDelete.passages.forEach(
						passage => story.deletePassage(transaction, passage)
					);

					story.deleteStory(transaction, toDelete);
				});
				break;
			}

			/*
			When saving a passage, we have to make sure to save its parent
			story too, since its lastUpdate property has changed.
			*/

			case 'CREATE_PASSAGE_IN_STORY': {
				const parentStory = state.story.stories.find(
					s => s.id === mutation.payload[0]
				);
				const passage = parentStory.passages.find(
					p => p.name === mutation.payload[1].name
				);

				story.update(transaction => {
					story.saveStory(transaction, parentStory);
					story.savePassage(transaction, passage);
				});
				break;
			}

			case 'UPDATE_PASSAGE_IN_STORY': {
				/* Is this a significant update? */

				if (Object.keys(mutation.payload[2]).some(key => key !== 'selected')) {
					const parentStory = state.story.stories.find(
						s => s.id === mutation.payload[0]
					);
					const passage = parentStory.passages.find(
						p => p.id === mutation.payload[1]
					);

					story.update(transaction => {
						story.saveStory(transaction, parentStory);
						story.savePassage(transaction, passage);
					});
				}
				break;
			}
				
			case 'DELETE_PASSAGE_IN_STORY': {
				const parentStory = state.story.stories.find(
					s => s.id === mutation.payload[0]
				);

				/*
				We can't dig up the passage in question right now, because
				previousStories is only a shallow copy, and it's gone there at
				this point in time.
				*/

				story.update(transaction => {
					story.saveStory(transaction, parentStory);
					story.deletePassageById(transaction, mutation.payload[1]);
				});
				break;
			}

			case 'UPDATE_PREF':
				pref.save(store);
				break;

			case 'CREATE_FORMAT':
			case 'UPDATE_FORMAT':
			case 'DELETE_FORMAT':
				storyFormat.save(store);
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
		We save a copy of the stories structure in aid of deleting, as above.
		*/
		
		previousStories = state.story.stories;
	});
};

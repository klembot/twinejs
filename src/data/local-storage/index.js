// This emulates the persistence strategy used by Backbone's local storage
// adapter as a Vuex middleware. This uses this basic pattern:
//
// twine-[datakey]: a comma separated list of IDs
// twine-[datakey]-[uuid]: JSON formatted data for that object
//
// This pattern is emulated, even with structures (like prefs) that don't need
// this, for compatibility.

const pref = require('./pref');
const story = require('./story');
const storyFormat = require('./story-format');

let enabled = true;
let previousStories;

module.exports = {
	onInit(state, store) {
		enabled = false;
		pref.load(store);
		story.load(store);
		previousStories = state.story.stories;
		enabled = true;
	},

	onMutation(mutation, state, store) {
		if (!enabled) {
			return;
		}

		switch (mutation.type) {
			case 'UPDATE_PREF':
				pref.save(store);
				break;

			// For story mutations, we take care to only save the affected story.

			case 'CREATE_STORY':
				story.save(
					store,
					[state.story.stories.find(
						s => s.name === mutation.payload[0].name
					)]
				);
				break;

			case 'UPDATE_STORY':
				story.save(
					store,
					[state.story.stories.find(
						s => s.id === mutation.payload[0]
					)]
				);
				break;

			case 'DELETE_STORY':
				// We have to use our last copy of the stories array, because
				// by now the deleted story is gone from the state.

				story.delete(
					store,
					[previousStories.find(s => s.id === mutation.payload[0])]
				);
				break;

			case 'DUPLICATE_STORY':
				story.save(
					store,
					[state.story.stories.find(
						s => s.name === mutation.payload[1]
					)]
				);
				break;

			case 'ADD_FORMAT':
			case 'UPDATE_FORMAT':
			case 'DELETE_FORMAT':
				storyFormat.save(store);
				break;

			case 'LOAD_FORMAT':
				// This change doesn't need to be persisted.
				break;
				

			default:
				throw new Error(`Don't know how to handle mutation ${mutation.type}`);
		}

		// We save a copy of the stories structure in aid of deleting, as above.
		
		previousStories = state.story.stories;
	}
}

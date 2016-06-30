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

let enabled = true;

module.exports = {
	onInit(state, store) {
		enabled = false;
		pref.load(store);
		story.load(store);
		enabled = true;
	},

	onMutation(mutation, state, store) {
		if (!enabled) {
			return;
		}

		console.log('mutation', mutation);
		pref.save(store);
		story.save(store, state.story.stories);
	}
}

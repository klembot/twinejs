// Methods for retrieving data from a store.

module.exports = {
	allStories(state) {
		return state.story.stories;
	},

	prefNamed(state, name) {
		return state.pref[name];
	}
}

// Methods for retrieving data from a store.

module.exports = {
	allStories(state) {
		return state.story.stories;
	},

	storyWithId(state, id) {
		return state.story.stories.find(story => story.id === id);
	},

	prefNamed(state, name) {
		return state.pref[name];
	},

	allFormats(state) {
		return state.storyFormat.formats;
	},

	formatNamed(state, name) {
		return state.storyFormat.formats.find(format => format.name === name);
	}
}

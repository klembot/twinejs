// Vuex actions that components can use.

module.exports = {
	setPref({ dispatch }, name, value) {
		dispatch('UPDATE_PREF', name, value);
	},

	defaultPref({ dispatch }, name, value) {
		// FIXME
	},

	createStory({ dispatch }, name) {
		dispatch('CREATE_STORY', { name });
	}
};

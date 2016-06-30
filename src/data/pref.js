// A Vuex module for working with application preferences. This is a bit
// over-engieneered, as it is designed to be compatible with Twine 2.0 data
// structures, where each preference had to have its own ID.

module.exports = {
	state: {
		welcomeSeen: false
	},

	mutations: {
		UPDATE_PREF(state, name, value) {
			state[name] = value;
		}
	}
};

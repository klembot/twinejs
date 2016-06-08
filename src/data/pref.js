// A Vuex module for working with application preferences. This is a bit
// over-engieneered, as it is designed to be compatible with Twine 2.0 data
// structures, where each preference had to have its own ID.

const uuid = require('tiny-uuid');

module.exports = {
	state: {
		prefs: []
	},

	mutations: {
		UPDATE_PREF(state, name, value) {
			let pref = state.prefs.find(pref => pref.name === name);

			if (pref) {
				pref.value = value;
			}
			else {
				// We'll need to create it.

				pref = {
					id: uuid(),
					name,
					value
				};

				state.prefs.push(pref);
			}
		}
	}
};

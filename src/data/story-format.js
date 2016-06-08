// A Vuex module for working with story formats.

const uuid = require('tiny-uuid');

module.exports = {
	state: {
		formats: []
	},

	mutations: {
		ADD_FORMAT(state, props) {
			let newFormat = Object.assign({}, props);
			newFormat.id = uuid();
			state.formats.push(newFormat);
		},

		DELETE_FORMAT(id) {
			state.formats = state.formats.filter(format => format.id !== id);
		}
	}
};

// A Vuex module for working with story formats.

const uuid = require('tiny-uuid');
const locale = require('../locale');

const formatDefaults = {
	name: locale.say('Untitled Story Format'),
	url: '',
	userAdded: true,
	properties: {}
};

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

		DELETE_FORMAT(state, id) {
			state.formats = state.formats.filter(format => format.id !== id);
		},

		UPDATE_FORMAT(state, id, props) {
			let format = state.formats.find(format => format.id === id);
			Object.assign(format, props);
		},

		LOAD_FORMAT(state, id, props) {
			let format = state.formats.find(format => format.id === id);
			format.properties = props;
			format.loaded = true;

			if (format.setup) {
				format.setup.call(format);
			}
		}
	}
};

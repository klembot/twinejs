/*
A Vuex module for working with story formats.
*/

import uuid from 'tiny-uuid';
import {formatDefaults} from './defaults';
import * as getters from './getters';

export const state = {formats: []};

export const mutations = {
	create(state, props) {
		state.formats.push({
			id: uuid(),
			...formatDefaults,
			...props,
			loaded: false,
			properties: {}
		});
	},
	delete(state, {id}) {
		state.formats = state.formats.filter(f => f.id !== id);
	},
	setProperties(state, {id, props}) {
		/*
		Sets properties on a format, usually after it has been loaded via JSONP.
		*/

		let format = getters.formatWithId(state, id);

		format.properties = props;
		format.loaded = true;

		/*
		A format may supply a setup function that runs when the format is first
		loaded.
		*/

		if (format.properties.setup) {
			format.properties.setup.call(format);
		}
	},
	update(state, {id, props}) {
		let format = getters.formatWithId(state, id);

		Object.assign(format, props);
	}
};

export const actions = {
	create({commit}, props) {
		commit('create', props);
	},
	delete({commit}, {id}) {
		commit('delete', {id});
	},
	update({commit}, {id, props}) {
		commit('update', {id, props});
	}
};
export default {actions, getters, mutations, state, namespaced: true};

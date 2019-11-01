/*
A Vuex module to manage user preferences.
*/

import defaults from './defaults';

export const state = {...defaults};

export const mutations = {
	update(state, prefs) {
		Object.keys(prefs).forEach(key => (state[key] = prefs[key]));
	}
};

export const actions = {
	repair({commit, state}) {
		/*
		Repair defaults.
		*/

		Object.keys(defaults).forEach(prefName => {
			if (typeof state[prefName] !== typeof defaults[prefName]) {
				// eslint-disable-next-line no-console
				console.info(`Repairing ${prefName} preference`);
				actions.update({commit}, {[prefName]: defaults[prefName]});
			}
		});
	},
	update({commit}, prefs) {
		commit('update', prefs);
	}
};

export default {actions, mutations, state, namespaced: true};

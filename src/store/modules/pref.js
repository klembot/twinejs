/*
A Vuex module to manage user preferences.
*/

export const state = {
	appTheme: 'light',
	defaultFormat: 'Harlowe',
	donateShown: false,
	firstRunTime: new Date().getTime(),
	lastUpdateSeen: '',
	lastUpdateCheckTime: new Date().getTime(),
	locale:
		window.navigator.userLanguage ||
		window.navigator.language ||
		window.navigator.browserLanguage ||
		window.navigator.systemLanguage ||
		'en-us',
	proofingFormat: 'Paperthin',
	welcomeSeen: false
};

export const mutations = {
	update(state, props) {
		Object.keys(props).forEach(key => (state[key] = props[key]));
		console.log('after mutation', props, state);
	}
};

export const actions = {
	update({commit}, props) {
		commit('update', props);
	}
};

export default {actions, mutations, state, namespaced: true};

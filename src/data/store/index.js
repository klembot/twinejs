/*
The main module managing the application's Vuex state and mutations.
*/

const Vue = require('vue');
const Vuex = require('vuex');
const isElectron = require('../../electron/is-electron');

Vue.use(Vuex);

module.exports = new Vuex.Store({
	modules: {
		appInfo: require('./app-info'),
		pref: require('./pref'),
		story: require('./story'),
		storyFormat: require('./story-format')
	},

	plugins: [
		isElectron() ? require('../file-system') : require('../local-storage')
	]
});

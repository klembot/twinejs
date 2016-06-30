// The main module managing the application's Vuex state and mutations.

let Vue = require('vue');
let Vuex = require('vuex');

Vue.use(Vuex);

module.exports = new Vuex.Store({
	modules: {
		pref: require('./pref'),
		story: require('./story'),
		'story-format': require('./story-format')
	},
	
	middlewares: [
		require('./local-storage')
	]
});

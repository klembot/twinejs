import Vue from 'vue';
import Vuex from 'vuex';
import appInfo from './modules/app-info';
import localStorage from './persistence/local-storage';
import pref from './modules/pref';
import story from './modules/story';
import storyFormat from './modules/story-format';

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {appInfo, pref, story, storyFormat},
	plugins: [
		localStorage,
		store => {
			store.subscribe((mutation, state) => {
				console.log(mutation, state);
			});
		}
	]
});

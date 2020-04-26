import Vue from 'vue';
import Vuex from 'vuex';
import appInfo from './modules/app-info';
import localStorage from './persistence/local-storage';
import pref from './modules/pref';
import story from './modules/story';
import storyFormat from './modules/story-format';

Vue.use(Vuex);

const store = new Vuex.Store({
	modules: {appInfo, pref, story, storyFormat},
	plugins: [localStorage]
});

/*
Automatically try to repair any store problems. This order is important, as
prefs consults existing story formats to set defaults, and stories check prefs
when setting story formats.
*/

store.dispatch('pref/repair');
store.dispatch('storyFormat/repairFormats');
store.dispatch('story/repairStories');

export default store;

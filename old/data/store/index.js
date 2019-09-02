/*
The main module managing the application's Vuex state and mutations. Because we
need to conditionally include the correct persistence module based on platform,
we use a Webpack alias to choose the right one. We can't simply import both
because the file system one references things that don't exist in a browser
context.
*/

import Vue from 'vue';
import Vuex from 'vuex';
import appInfo from './app-info';
import persistence from 'twine-vuex-persistence';
import {store as pref} from './pref';
import {store as story} from './story';
import {store as storyFormat} from './story-format';

Vue.use(Vuex);

const store = new Vuex.Store({
	modules: {
		appInfo,
		pref,
		story,
		storyFormat
	},
	plugins: [persistence]
});

export default store;

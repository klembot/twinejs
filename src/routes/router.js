import Vue from 'vue';
import VueRouter from 'vue-router';
import AboutTwine from './about-twine';
import LocaleSelect from './locale-select';
import store from '../store';
import PassageEdit from './passage-edit';
import StoryEdit from './story-edit';
import StoryEditJavaScript from './story-edit-javascript';
import StoryEditStylesheet from './story-edit-stylesheet';
import StoryFormatList from './story-format-list';
import StoryImport from './story-import';
import StoryList from './story-list';
import StoryPlay from './story-play';
import StoryProof from './story-proof';
import StorySearch from './story-search';
import StoryStats from './story-stats';
import StoryTest from './story-test';
import Welcome from './welcome';

Vue.use(VueRouter);

export const Router = new VueRouter({
	mode: 'history',
	routes: [
		{path: '/about', component: AboutTwine},
		{path: '/import', component: StoryImport},
		{path: '/locale', component: LocaleSelect},
		{path: '/stories', component: StoryList},
		{path: '/stories/:storyId', component: StoryEdit},
		{path: '/stories/:storyId/javascript', component: StoryEditJavaScript},
		{path: '/stories/:storyId/passage/:passageId', component: PassageEdit},
		{path: '/stories/:storyId/play', component: StoryPlay},
		{path: '/stories/:storyId/proof', component: StoryProof},
		{path: '/stories/:storyId/search', component: StorySearch},
		{path: '/stories/:storyId/statistics', component: StoryStats},
		{path: '/stories/:storyId/stylesheet', component: StoryEditStylesheet},
		{path: '/stories/:storyId/test', component: StoryTest},
		{path: '/stories/:storyId/test/:passageId', component: StoryTest},
		{path: '/story-formats', component: StoryFormatList},
		{path: '/welcome', component: Welcome},
		{path: '*', component: StoryList}
	],
	scrollBehavior(to, from, savedPosition) {
		/*
		Try to restore scroll position where possible.
		See https://router.vuejs.org/guide/advanced/scroll-behavior.html
		*/

		if (savedPosition) {
			return savedPosition;
		} else {
			return {x: 0, y: 0};
		}
	}
});

let history = [];

Router.beforeEach((to, from, next) => {
	/*
	If we are returning to the route we were just on, force this to be a 'back'
	action in the browser history to avoid cluttering history.
	*/

	if (history.length > 1 && to.fullPath === history[history.length - 2]) {
		history.pop();
		Router.back();
		next(false);
		return;
	}

	/*
	If we going back by the previous logic, we will see a second beforeEach()
	call which will otherwise create duplicate history entries.
	*/

	if (history[history.length - 1] !== to.fullPath) {
		history.push(to.fullPath);
	}

	/*
	If the user has never seen the welcome route, redirect any request there.
	*/

	if (to.path !== '/welcome' && !store.state.pref.welcomeSeen) {
		next('/welcome');
	} else {
		next();
	}
});

export default Router;

import Vue from 'vue';
import VueRouter from 'vue-router';
import AboutTwine from './about-twine';
import LocaleSelect from './locale-select';
import store from '../store';
import StoryEdit from './story-edit';
import StoryList from './story-list';
import StoryPlay from './story-play';
import StoryProof from './story-proof';
import StoryTest from './story-test';
import Welcome from './welcome';

Vue.use(VueRouter);

export const Router = new VueRouter({
	routes: [
		{path: '/about', component: AboutTwine},
		{path: '/locale', component: LocaleSelect},
		{path: '/stories', component: StoryList},
		{path: '/stories/:storyId', component: StoryEdit},
		{path: '/stories/:storyId/play', component: StoryPlay},
		{path: '/stories/:storyId/proof', component: StoryProof},
		{path: '/stories/:storyId/test', component: StoryTest},
		{path: '/stories/:storyId/test/:passageId', component: StoryTest},
		{path: '/welcome', component: Welcome},
		{path: '*', component: StoryList}
	]
});

/*
If the user has never seen the welcome route, redirect any request there.
*/

Router.beforeEach((to, from, next) => {
	if (to.path !== '/welcome' && !store.state.pref.welcomeSeen) {
		next('/welcome');
	} else {
		next();
	}
});

export default Router;

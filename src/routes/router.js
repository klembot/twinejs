import Vue from 'vue';
import VueRouter from 'vue-router';
import Locale from './locale';
import store from '../store';
import StoryList from './story-list';
import Welcome from './welcome';

Vue.use(VueRouter);

export const Router = new VueRouter({
	routes: [
		{path: '/locale', component: Locale},
		{path: '/stories', component: StoryList},
		{path: '/welcome', component: Welcome},
		{path: '*', component: Welcome}
	]
});

/*
If the user has never seen the welcome route, redirect any request there.
*/

Router.beforeEach((to, from, next) => {
	console.log(to, from, store.state.pref);

	if (to.path !== '/welcome' && !store.state.pref.welcomeSeen) {
		next('/welcome');
	} else {
		next();
	}
});

export default Router;

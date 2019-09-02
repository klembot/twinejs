/* The main app running the show. */

import Vue from 'vue';
import {init} from '../../ui';
import {repairFormats} from '../../data/actions/story-format';
import {repairStories} from '../../data/actions/story';
import store from '../../data/store';
import router from '../router';

export default Vue.extend({
	router: router,
	template: '<div><router-view></router-view></div>',
	mounted() {
		this.$nextTick(function() {
			/* code that assumes this.$el is in-document */
			init();
			this.repairFormats();
			this.repairStories();
			document.body.classList.add(`theme-${this.themePref}`);
		});
	},
	watch: {
		themePref(value, oldValue) {
			document.body.classList.remove(`theme-${oldValue}`);
			document.body.classList.add(`theme-${value}`);
		}
	},
	vuex: {
		actions: {repairFormats, repairStories},
		getters: {
			themePref: state => state.pref.appTheme
		}
	},
	store
});

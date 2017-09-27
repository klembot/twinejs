/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
const Vue = require('vue');
const scroll = require('scroll');
const { setPref } = require('../data/actions/pref');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		/* How many sections are currently visible. */
		shown: 1
	}),

	methods: {
		next() {
			this.shown++;
			
			Vue.nextTick(() => {
				scroll.top(
					document.body,
					document.querySelector(
					'#welcomeView > div:last-of-type').offsetTop,
					{ duration: 400 });
			});
		},

		finish() {
			this.setPref('welcomeSeen', true);
			window.location.hash = '#stories';
		}
	},

	vuex: {
		actions: {
			setPref
		}
	}
});

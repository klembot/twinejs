/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
const Vue = require('vue');
const scrollTo = require('scroll-to-element');
const { setPref } = require('../data/actions');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		// How many sections are currently visible.
		shown: 1
	}),

	methods: {
		next() {
			this.shown++;
			
			// Scroll to the new element. We set a timeout here so that its
			// position is available to us.
			
			window.setTimeout(() => {
				scrollTo(document.querySelector(
					'#welcomeView > div:last-of-type'),
					{ duration: 400 });
			}, 10);
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

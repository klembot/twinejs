/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
 **/

'use strict';
const Vue = require('vue');
const scroll = require('scroll');
const {setPref} = require('../data/actions/pref');

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
					{duration: 400});
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

x = {
	"id": "5be1fa91-dab5-4ff1-b6ed-8f22bad145b3",
	"story": "67021b99-2db0-47b1-acc0-d7fc659516fd",
	"top": 230.5,
	"left": 562,
	"width": 100,
	"height": 100,
	"tags": ["tag1"],
	"name": "Start",
	"selected": true,
	"text": "Test\n\n[[test passage]]\n\n[[another test passage | 'Hey!!']]"
}

y = {
	"id": "460373da-eca3-4137-a8a5-3c75f4b8c574",
	"story": "67021b99-2db0-47b1-acc0-d7fc659516fd",
	"top": 380.5,
	"left": 487,
	"width": 100,
	"height": 100,
	"tags": [],
	"name": "test passage",
	"selected": true,
	"text": "Testing this one up"
}

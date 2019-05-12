/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

"use strict";
const locale = require("../locale");
const Vue = require('vue');
const scroll = require('scroll');
const isElectron = require('../electron/is-electron');
const {setPref} = require('../data/actions/pref');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		/* How many sections are currently visible. */
		shown: 1,
		isElectron: isElectron()
	}),

	computed: {
		neverUsed() {
			return locale.say(
				`<strong>If you've never used Twine before,</strong> then welcome! The <a href=\"http://twinery.org/2guide\" target=\"_blank\">Twine 2 Guide</a> and the official wiki in general, are a great place to learn. Keep in mind that some articles on the wiki were written for Twine 1, which is a little bit different than this version. But most of the concepts are the same.`
			);
		},
		twineForum() {
			return locale.say(
				`You can also get help over at the <a href="http://twinery.org/forum" target="_blank">Twine forum</a>, too.`
			);
		},
		usedBefore() {
			return locale.say(
				`<strong>If you have used Twine 1 before,</strong> the guide also has details on what has changed in this version. Chief among them is a new default story format, Harlowe. But if you find you prefer the Twine 1 scripting syntax, try using SugarCube instead.`
			);
		},
		noAccountNeeded() {
			return locale.say(
				"That means you don't need to create an account to use Twine 2, and everything you create isn't stored on a server somewhere else &mdash; it stays right in your browser."
			);
		},
		localStorage() {
			return locale.say(
				"Secondly, <b>anyone who can use this browser can see and make changes to your work</b>. So if you've got a nosy kid brother, look into setting up a separate profile for yourself."
			);
		},
		thingsToRemember() {
			return locale.say(
				'Two <b>very important</b> things to remember, though. Since your work is saved only in your browser, if you clear its saved data, then you\'ll lose your work! Not good. Remember to use that <i class="fa fa-briefcase"></i>&nbsp;<strong>Archive</strong> button often. You can also publish individual stories to files using the <i class="fa fa-cog"></i> menu on each story in the story list. Both archive and story files can always be re-imported into Twine.'
			);
		}
	},

	methods: {
		next() {
			this.shown++;

			Vue.nextTick(() => {
				scroll.top(
					document.documentElement || document.body,
					document.querySelector('#welcomeView > div:last-of-type')
						.offsetTop,
					{duration: 400}
				);
			});
		},

		finish() {
			this.setPref("welcomeSeen", true);
			this.$router.push("stories");
		}
	},

	vuex: {
		actions: {
			setPref
		}
	}
});

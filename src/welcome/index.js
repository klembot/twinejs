/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

"use strict";
const Vue = require("fullvue");
const scroll = require("scroll");
const locale = require("../locale");
const { setPref } = require("../data/actions/pref");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		/* How many sections are currently visible. */
		shown: 1
	}),

	computed: {
		neverUsed() {
			return locale.say(
				`&lt;strong&gt;If you've never used Twine before,&lt;/strong&gt; then welcome! The &lt;a href=\"http://twinery.org/2guide\" target=\"_blank\"&gt;Twine 2 Guide&lt;/a&gt; and the official wiki in general, are a great place to learn. Keep in mind that some articles on the wiki at large were written for Twine 1, which is a little bit different than this version. But most of the concepts are the same.`
			);
		},
		twineForum() {
			return locale.say(
				`You can also get help over at the &lt;a href="http://twinery.org/forum" target="_blank"&gt;Twine forum</a>, too.`
			);
		},
		usedBefore() {
			return locale.say(
				`&lt;strong&gt;If you have used Twine 1 before,&lt;/strong&gt; the guide also has details on what has changed in this version. Chief among them is a new default story format, Harlowe. But if you find you prefer the Twine 1 scripting syntax, try using SugarCube instead.`
			);
		},
		noAccountNeeded() {
			return locale.say(
				"That means you don't need to create an account to use Twine 2, and everything you create isn't stored on a server somewhere else &mdash; it stays right in your browser."
			);
		},
		localStorage() {
			return locale.say(
				"Secondly, &lt;b&gt;anyone who can use this browser can see and make changes to your work&lt;/b&gt;. So if you've got a nosy kid brother, look into setting up a separate profile for yourself."
			);
		},
		thingsToRemember() {
			return locale.say(
				'Two &lt;b&gt;very important&lt;/b&gt; things to remember, though. Since your work is saved only in your browser, if you clear its saved data, then you\'ll lose your work! Not good. Remember to use that &lt;i class="fa fa-briefcase"&gt;&lt;/i&gt;&nbsp;&lt;strong&gt;Archive&lt;/strong&gt; button often. You can also publish individual stories to files using the &lt;i class="fa fa-cog"&gt;&lt;/i&gt; menu on each story in the story list. Both archive and story files can always be re-imported into Twine.'
			);
		}
	},

	methods: {
		next() {
			this.shown++;

			Vue.nextTick(() => {
				scroll.top(
					document.body,
					document.querySelector("#welcomeView > div:last-of-type"),
					{ duration: 400 }
				);
			});
		},

		finish() {
			this.setPref("welcomeSeen", true);
			window.location.hash = "#stories";
		}
	},

	vuex: {
		actions: {
			setPref
		}
	}
});

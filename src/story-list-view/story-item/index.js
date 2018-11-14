// An individual item in the list managed by StoryListView.  This offers quick
// links for editing, playing, and deleting a story; StoryEditView handles more
// detailed changes.

"use strict";
const moment = require("moment");
const Vue = require('vue');
const eventHub = require("../../common/eventHub");

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	components: {
		"item-preview": require("./item-preview"),
		"item-menu": require("./item-menu")
	},

	computed: {
		lastUpdateFormatted() {
			return moment(this.story.lastUpdate).format("lll");
		},

		hue() {
			// A hue based on the story's name.

			return (
				([this.story.name].reduce((hue, char) => hue + char.charCodeAt(0), 0) %
					40) *
				90
			);
		}
	},

	created: function() {
		// If our parent wants to edit our own model, then we do so. This is
		// done this level so that we animate the transition correctly.

		eventHub.$on("story-edit", id => {
			if (this.story.id === id) {
				this.edit();
			}
		});
	},

	methods: {
		/**
		 Opens a StoryEditView for this story.

		 @method edit
		**/

		edit() {
			this.$router.push({ path: "/stories/" + this.story.id });
		}
	}
});

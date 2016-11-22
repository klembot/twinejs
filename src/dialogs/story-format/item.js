// Shows a single story format, with a radio button to allow the user to
// choose it.

const Vue = require('vue');
const semverUtils = require('semver-utils');
const { updateStory } = require('../../data/actions');
require('./item.less');

module.exports = Vue.extend({
	template: require('./item.html'),

	props: {
		story: {
			type: Object,
			required: true
		},

		format: {
			type: Object,
			required: true
		}
	},

	computed: {
		selected() {
			return this.story.storyFormat === this.format.name &&
				this.story.storyFormatVersion === this.format.version;
		}
	},

	methods: {
		select() {
			this.updateStory(
				this.story.id,
				{
					storyFormat: this.format.name,
					storyFormatVersion: this.format.version
				}
			);
		}
	},

	vuex: {
		actions: {
			updateStory
		}
	}
});

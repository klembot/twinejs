// Shows a single story format, with a radio button to allow the user to
// choose it.

const Vue = require('vue');
const { updateStory } = require('../../data/actions/story');

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
		},

		/*
		Calculates the image source relative to the format's path.
		*/

		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');
			
			return path + '/' + this.format.properties.image;
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

// Shows a single story format, with a radio button to allow the user to
// choose it.

const Vue = require('vue');
const { updateStory } = require('../../data/actions');

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
		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');

			return path + '/' + this.format.properties.image;
		},

		selected() {
			return this.story.storyFormat === this.format.name;
		}
	},

	methods: {
		select() {
			this.updateStory(this.story.id, { storyFormat: this.format.name });
		}
	},

	vuex: {
		actions: {
			updateStory
		}
	}
});

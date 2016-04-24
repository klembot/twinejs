// Shows a single story format, with a radio button to allow the user to
// choose it.

const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./item.html'),

	props: ['story', 'format'],

	computed: {
		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');
			return path + '/' + this.format.image;
		},

		selected() {
			return this.story.get('storyFormat') === this.format.name;
		}
	},

	methods: {
		select() {
			this.story.save({ storyFormat: this.format.name });
		}
	}
});

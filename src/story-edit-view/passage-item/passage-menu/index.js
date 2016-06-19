// A contextual menu that appears when the user points at a passage.

const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: [
		'model',      // A passage
		'parentStory' // The story containing this passage
	],

	methods: {
		edit() {
			this.$dispatch('passage-edit');
		},

		delete(e) {
			this.$dispatch('passage-delete', e.shiftKey);
		},

		test() {
			this.$dispatch('story-test', this.model.id);
		},

		setAsStart() {
			this.$dispatch('story-set-start', this.model.id);
		}
	},

	components: {
		'drop-down': require('../../../ui/drop-down')
	}
});

// A contextual menu that appears when the user points at a passage.

const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		passage: {
			type: Object,
			required: true
		}
	},

	methods: {
		edit() {
			this.$dispatch('passage-edit');
		},

		delete(e) {
			this.$dispatch('passage-delete', e.shiftKey);
		},

		test() {
			this.$dispatch('story-test', this.passage.id);
		},

		setAsStart() {
			this.$dispatch('story-set-start', this.passage.id);
		}
	},

	components: {
		'drop-down': require('../../../ui/drop-down')
	}
});

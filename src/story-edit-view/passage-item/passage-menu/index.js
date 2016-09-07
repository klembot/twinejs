// A contextual menu that appears when the user points at a passage.

const Vue = require('vue');
const { updateStory } = require('../../../data/actions');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		passage: {
			type: Object,
			required: true
		},

		parentStory: {
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
			window.open(
				'#stories/' + this.parentStory.id + '/test/' + this.passage.id,
				'twinestory_test_' + this.parentStory.id
			);
		},

		setAsStart() {
			this.updateStory(
				this.parentStory.id, 
				{ startPassage: this.passage.id }
			);
		}
	},

	components: {
		'drop-down': require('../../../ui/drop-down')
	},

	vuex: {
		actions: { updateStory }
	}
});

const Vue = require('vue');
const without = require('lodash.without');
const { setTagColorInStory, updatePassageInStory } = require('../../../../data/actions');

require('./index.less');

module.exports = Vue.extend({
	props: {
		tag: {
			type: String,
			required: true
		},
		passage: {
			type: Object,
			required: true
		},
		storyId: {
			type: String,
			required: true
		}
	},

	template: require('./index.html'),

	methods: {
		remove() {
			this.updatePassageInStory(
				this.storyId,
				this.passage.id,
				{ tags: without(this.passage.tags, this.tag) }
			);
		},
		setColor(color) {
			this.setTagColorInStory(this.storyId, this.tag, color);
		}
	},

	vuex: {
		actions: { setTagColorInStory, updatePassageInStory }
	},

	components: {
		'drop-down': require('../../../../ui/drop-down')
	}
});
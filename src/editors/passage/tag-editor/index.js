/* An editor for adding and removing tags from a passage. */

const Vue = require('vue');
const locale = require('../../locale');
const { updatePassage } = require('../../../data/actions/passage');
const uniq = require('lodash.uniq');

module.exports = Vue.extend({
	data: () => ({
		newVisible: false
	}),

	computed: {
		tagColors() {
			return this.allStories.find(s => s.id === this.storyId).tagColors;
		},
		addTagPlaceholder() {
			return locale.say('Tag name');
		}
	},

	props: {
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
		showNew() {
			this.newVisible = true;
			this.$nextTick(() => this.$refs.newName.focus());
		},

		hideNew() {
			this.newVisible = false;
		},

		addNew() {
			const newName = this.$refs.newName.value.replace(/\s/g, '-');

			/* Clear the newName element while it's transitioning out. */

			this.$refs.newName.value = '';

			this.updatePassage(
				this.storyId,
				this.passage.id,
				{
					tags: uniq([].concat(this.passage.tags, newName))
				}
			);

			this.hideNew();
		}
	},

	vuex: {
		getters: {
			allStories: state => state.story.stories
		},
		actions: { updatePassage }
	},

	components: {
		'tag-menu': require('./tag-menu')
	}
});
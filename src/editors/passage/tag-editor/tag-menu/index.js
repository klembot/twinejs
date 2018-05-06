const Vue = require('vue');
const without = require('lodash.without');

const locale = require('../../locale');
const { setTagColorInStory } = require('../../../../data/actions/story');
const { updatePassage } = require('../../../../data/actions/passage');

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

	computed: {
		grayTitle() {
			return locale.say('Set tag color to gray');
		},
		redTitle() {
			return locale.say('Set tag color to red');
		},
		yellowTitle() {
			return locale.say('Set tag color to yellow');
		},
		greenTitle() {
			return locale.say('Set tag color to green');
		},
		blueTitle() {
			return locale.say('Set tag color to blue');
		},
		purpleTitle() {
			return locale.say('Set tag color to purple');
		},
	},

	template: require('./index.html'),

	methods: {
		remove() {
			this.updatePassage(
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
		actions: { setTagColorInStory, updatePassage }
	},

	components: {
		'drop-down': require('../../../../ui/drop-down')
	}
});
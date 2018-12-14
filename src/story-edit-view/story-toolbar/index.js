// The toolbar at the bottom of the screen with editing controls.

const Vue = require('vue');
const openWindow = require('../../ui/open-window');
const zoomMappings = require('../zoom-settings');
const {updateStory} = require('../../data/actions/story');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		},

		zoomDesc: {
			type: String,
			required: true
		}
	},

	components: {
		'story-menu': require('./story-menu'),
		'story-search': require('./story-search')
	},

	methods: {
		setZoom(description) {
			this.updateStory(this.story.id, {zoom: zoomMappings[description]});
		},

		test() {
			openWindow('#stories/' + this.story.id + '/test');
		},

		play() {
			openWindow('#stories/' + this.story.id + '/play');
		},

		addPassage() {
			this.$dispatch('passage-create');
		}
	},

	vuex: {
		actions: {
			updateStory
		}
	}
});

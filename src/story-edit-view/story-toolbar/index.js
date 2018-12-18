// The toolbar at the bottom of the screen with editing controls.

const Vue = require('vue');
const locale = require('../../locale');
const eventHub = require('../../common/eventHub');
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

	computed: {
		storyLinkTitle() {
			return locale.say('Go to the story list');
		},
		showOnlyStory() {
			return locale.say('Show only story structure');
		},
		showPassageTitlesOnly() {
			return locale.say('Show only passage titles');
		},
		showPassageTitlesAndExcerpts() {
			return locale.say('Show passage titles and excerpts');
		},
		storyTestMode() {
			return locale.say('Play this story in test mode');
		},
		storyPlayMode() {
			return locale.say('Play this story');
		},
		newPassageTitle() {
			return locale.say('Add a new passage');
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
			eventHub.$emit('passage-create');
		}
	},

	vuex: {
		actions: {
			updateStory
		}
	}
});

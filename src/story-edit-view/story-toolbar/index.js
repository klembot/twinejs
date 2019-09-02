// The toolbar at the bottom of the screen with editing controls.

import Vue from 'vue';
import eventHub from '../../common/eventHub';
import zoomMappings from '../zoom-settings';
import {playStory, testStory} from '../../common/launch-story';
import {say} from '../../locale';
import storyMenu from './story-menu';
import storySearch from './story-search';
import {updateStory} from '../../data/actions/story';
import template from './index.html';
import './index.less';

export default Vue.extend({
	template,
	props: {
		story: {type: Object, required: true},
		zoomDesc: {type: String, required: true}
	},
	computed: {
		storyLinkTitle() {
			return say('Go to the story list');
		},
		showOnlyStory() {
			return say('Show only story structure');
		},
		showPassageTitlesOnly() {
			return say('Show only passage titles');
		},
		showPassageTitlesAndExcerpts() {
			return say('Show passage titles and excerpts');
		},
		storyTestMode() {
			return say('Play this story in test mode');
		},
		storyPlayMode() {
			return say('Play this story');
		},
		newPassageTitle() {
			return say('Add a new passage');
		}
	},
	components: {
		'story-menu': storyMenu,
		'story-search': storySearch
	},
	methods: {
		setZoom(description) {
			this.updateStory(this.story.id, {zoom: zoomMappings[description]});
		},
		test() {
			testStory(this.$store, this.story.id);
		},
		play() {
			playStory(this.$store, this.story.id);
		},
		addPassage() {
			eventHub.$emit('passage-create');
		}
	},
	vuex: {actions: {updateStory}}
});

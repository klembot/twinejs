import Vue from 'vue';
import without from 'lodash.without';
import dropDown from '../../../../ui/drop-down';
import {say} from '../../../../locale';
import {setTagColorInStory} from '../../../../data/actions/story';
import {updatePassage} from '../../../../data/actions/passage';
import template from './index.html';
import './index.less';

export default Vue.extend({
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
			return say('Set tag color to gray');
		},
		redTitle() {
			return say('Set tag color to red');
		},
		yellowTitle() {
			return say('Set tag color to yellow');
		},
		greenTitle() {
			return say('Set tag color to green');
		},
		blueTitle() {
			return say('Set tag color to blue');
		},
		purpleTitle() {
			return say('Set tag color to purple');
		}
	},
	template,
	methods: {
		remove() {
			this.updatePassage(this.storyId, this.passage.id, {
				tags: without(this.passage.tags, this.tag)
			});
		},
		setColor(color) {
			this.setTagColorInStory(this.storyId, this.tag, color);
		}
	},
	vuex: {
		actions: {setTagColorInStory, updatePassage}
	},
	components: {
		'drop-down': dropDown
	}
});

/*
A component showing a modal dialog where a story's stylesheet can be edited.
*/

import Vue from 'vue';
import codeMirror from '../../vue/codemirror';
import modalDialog from '../../ui/modal-dialog';
import {updateStory} from '../../data/actions/story';
import template from './index.html';
import 'codemirror/mode/css/css';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/hint/show-hint';

export default Vue.component('StylesheetEditor', {
	template,
	props: ['storyId', 'origin'],
	computed: {
		source() {
			return this.allStories.find(story => story.id === this.storyId)
				.stylesheet;
		},
		cmOptions: () => ({
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 4,
			indentWithTabs: true,
			mode: 'css',
			extraKeys: {
				'Ctrl-Space'(cm) {
					cm.showHint();
				}
			}
		})
	},
	methods: {
		resetCm() {
			this.$refs.codemirror.reset();
		},
		save(text) {
			this.updateStory(this.storyId, {stylesheet: text});
		}
	},
	components: {
		'modal-dialog': modalDialog,
		'code-mirror': codeMirror
	},
	vuex: {
		actions: {updateStory},
		getters: {allStories: state => state.story.stories}
	}
});

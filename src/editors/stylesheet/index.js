/*
A component showing a modal dialog where a story's stylesheet can be edited.
*/

const Vue = require('vue');
const { updateStory } = require('../../data/actions/story');

require('codemirror/mode/css/css');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storyId: '',
		origin: null
	}),

	computed: {
		source() {
			return this.allStories.find(
				story => story.id === this.storyId
			).stylesheet;
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
			this.updateStory(this.storyId, { stylesheet: text });
		}
	},
	
	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
		'code-mirror': require('../../vue/codemirror')
	},

	vuex: {
		actions: {
			updateStory
		},

		getters: {
			allStories: state => state.story.stories
		}
	}
});

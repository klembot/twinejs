// A component showing a modal dialog where a story's JavaSCript.

const Vue = require('vue');
const { updateStory } = require('../../data/actions/story');

require('codemirror/mode/javascript/javascript');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storyId: ''
	}),

	computed: {
		source() {
			return this.allStories.find(
				story => story.id === this.storyId
			).script;
		},

		cmOptions: () => ({
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 2,
			indentWithTabs: true,
			mode: 'javascript',
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
			this.updateStory(this.storyId, { script: text });
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

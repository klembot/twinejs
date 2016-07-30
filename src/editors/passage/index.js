// A modal dialog for editing a single passage.

const CodeMirror = require('codemirror');
const Vue = require('vue');
const locale = require('../../locale');
const { thenable } = require('../../vue/mixins/thenable');
const { updatePassageInStory } = require('../../data/actions');

require('codemirror/addon/display/placeholder');
require('../../codemirror/prefix-trigger');

// Expose CodeMirror to story formats, currently for Harlowe compatibility.

window.CodeMirror = CodeMirror;

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		passageId: '',
		storyId: '',
		oldWindowTitle: '',
		saveError: '',
		hasError: false
	}),

	computed: {
		cmOptions() {
			return {
				placeholder: locale.say(
					'Enter the body text of your passage here. To link to another ' +
					'passage, put two square brackets around its name, [[like ' +
					'this]].'
				),
				prefixTrigger: {
					prefixes: ['[[', '->'],
					callback: this.autocomplete.bind(this)
				},
				extraKeys: {
					'Ctrl-Space': this.autocomplete.bind(this)
				},
				indentWithTabs: true,
				lineWrapping: true,
				lineNumbers: false,
				mode: 'text'
			};
		},

		parentStory() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		passage() {
			return this.parentStory.passages.find(
				passage => passage.id === this.passageId
			);
		},

		autocompletions() {
			return this.parentStory.passages.map(passage => passage.name);
		}
	},

	methods: {
		autocomplete() {
			this.$refs.codemirror.$cm.showHint({
				hint: cm => {
					const wordRange = cm.findWordAt(cm.getCursor());
					const word = cm.getRange(
						wordRange.anchor,
						wordRange.head
					).toLowerCase();

					const comps = {
						list: this.autocompletions.filter(
							name => name.toLowerCase().indexOf(word) !== -1
						),
						from: wordRange.anchor,
						to: wordRange.head
					};

					CodeMirror.on(comps, 'pick', () => {
						const doc = cm.getDoc();

						doc.replaceRange(']] ', doc.getCursor());
					});

					return comps;
				},

				completeSingle: false,

				extraKeys: {
					']'(cm, hint) {
						const doc = cm.getDoc();

						doc.replaceRange(']', doc.getCursor());
						hint.close();
					},

					'-'(cm, hint) {
						const doc = cm.getDoc();

						doc.replaceRange('-', doc.getCursor());
						hint.close();
					},

					'|'(cm, hint) {
						const doc = cm.getDoc();

						doc.replaceRange('|', doc.getCursor());
						hint.close();
					}
				}
			});
		},

		saveText(text) {
			this.updatePassageInStory(
				this.parentStory.id,
				this.passage.id,
				{ text: text }
			);
		},

		saveTags(tags) {
			this.updatePassageInStory(
				this.parentStory.id,
				this.passage.id,
				{ tags: tags }
			);
		},

		dialogDestroyed() {
			this.$destroy();
		},

		setError(model) {
			this.$refs.modal.$el.classList.add('hasError');
			this.saveError = model.validationError;
			this.hasError = true;
		},

		clearError() {
			this.$refs.modal.$el.classList.remove('hasError');
			this.hasError = false;
		},

		canClose() {
			return !this.hasError;
		}
	},

	ready() {
		// Update the window title.

		this.oldWindowTitle = document.title;
		document.title = locale.say('Editing \u201c%s\u201d', this.passage.name);

		// Load the story's format and see if it offers a CodeMirror mode.

		if (this.$options.storyFormat) {
			this.$options.storyFormat.load((err) => {
				const modeName = this.$options.storyFormat.get('name').toLowerCase();
				
				if (!err && modeName in CodeMirror.modes) {
					// This is a small hack to allow modes such as Harlowe to
					// access the full text of the textarea, permitting its
					// lexer to grow a syntax tree by itself.

					CodeMirror.modes[modeName].cm = this.$refs.codemirror.$cm;

					// Now that's done, we can assign the mode and trigger a
					// re-render.

					this.$refs.codemirror.$cm.setOption('mode', modeName);
				}
			});
		}

		// Set the mode to the default, 'text'. The above callback will reset
		// it if it fires.

		this.$refs.codemirror.$cm.setOption('mode', 'text');
	},

	destroyed() {
		document.title = this.oldWindowTitle;
	},

	components: {
		'code-mirror': require('../../vue/codemirror'),
		'modal-dialog': require('../../ui/modal-dialog'),
		'tag-editor': require('./tag-editor')
	},

	vuex: {
		actions: {
			updatePassageInStory
		},

		getters: {
			allStories: state => state.story.stories
		}
	},

	mixins: [thenable]
});

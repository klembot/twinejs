// A modal dialog for editing a single passage.

const CodeMirror = require('codemirror');
const Vue = require('vue');
const locale = require('../../locale');
const backboneModel = require('../../vue/mixins/backbone-model');
require('codemirror/addon/display/placeholder');
require('../../codemirror-ext/prefix-trigger');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		saveError: '',
		hasError: false,
		name: '',
		text: '',
		tags: []
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
		}
	},

	methods: {
		autocomplete() {
			const autocompletions = this.autocompletions;

			this.$refs.codemirror.$cm.showHint({
				hint(cm) {
					const wordRange = cm.findWordAt(cm.getCursor());
					const word = cm.getRange(
						wordRange.anchor,
						wordRange.head
					).toLowerCase();

					const comps = {
						list: autocompletions.filter(
							(name) => name.toLowerCase().indexOf(word) != -1
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
			this.text = text;
		},

		saveTags(tags) {
			this.tags = tags;
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

		this.$oldWindowTitle = document.title;
		document.title = locale.say('Editing \u201c%s\u201d', this.name);

		// Map model validation errors to the saveError property.

		this.$model.on('invalid', this.setError, this);
		this.$model.on('sync', this.clearError, this);

		// Assemble a list of possible autocompletions by plucking passage names
		// from the collection property.

		this.autocompletions = this.$options.collection.map((passage) => passage.get('name'));
	},

	destroyed() {
		document.title = this.$oldWindowTitle;
		this.$model.off('invalid', this.setError);
		this.$model.off('sync', this.clearError);
	},

	components: {
		'code-mirror': require('../../vue/codemirror'),
		'modal-dialog': require('../../ui/modal-dialog'),
		'tag-editor': require('./tag-editor')
	},

	mixins: [backboneModel]
});

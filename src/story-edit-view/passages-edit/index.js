/*
A modal dialog for editing a multiple passages.
*/

const Vue = require('vue');
const locale = require('../../locale');
const { thenable } = require('../../vue/mixins/thenable');

require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');
require('../../codemirror/prefix-trigger');
const {
	updatePassage,
	createNewlyLinkedPassages
} =
	require('../../data/actions/passage');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		},
	},

	data: () => ({
		tagName: '',
		appendText: '',
	}),

	computed: {
		selectedPassages() { return this.story.passages.filter(passage => passage.selected); },
		allTags() { return this.story.passages.map(passage => passage.tags).flat()
			.reduce((tags, tag) => { tags[tag] = this.story.tagColors[tag] || ''; return tags; }, {}); },
	},

	methods: {
		apply() {
			console.log(this.tagName, this.appendText);
			this.selectedPassages.forEach(passage => {
				var oldText = passage.text;
				if (this.appendText) passage.text += '\n' + this.appendText;
				if (this.tagName) this.tagName.split(',')
					.filter(Boolean).forEach(tag => {
						if (!passage.tags.includes(tag))
							passage.tags.push(tag);
					});

				this.createNewlyLinkedPassages(
					this.story.id,
					passage.id,
					oldText,
				);
				this.updatePassage(
					this.story.id,
					passage.id,
					{ ...passage }
				);
			});
		},
		dialogDestroyed() {
			this.apply();
			setTimeout(() => this.$destroy());
		},
	},

	ready() {
	},

	destroyed() {
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
		'tag-editor': require('../../editors/passage/tag-editor'),
	},

	vuex: {
		actions: {
			updatePassage,
			createNewlyLinkedPassages,
		},

		getters: {
		}
	},

	mixins: [thenable]
});

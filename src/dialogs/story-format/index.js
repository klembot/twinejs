// story.

const Vue = require('vue');
const { loadFormat } = require('../../data/actions');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		loadIndex: 0,
		loadedFormats: [],
		storyId: ''
	}),

	computed: {
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		working() {
			return this.loadIndex < this.formatNames.length;
		}
	},

	methods: {
		loadNext() {
			if (!this.working) {
				return;
			}

			this.loadFormat(this.formatNames[this.loadIndex])
			.then(format => {
				if (!format.properties.proofing) {
					this.loadedFormats.push(format);
				}

				this.loadIndex++;
				this.loadNext();
			});
		}
	},

	ready() {
		this.loadNext();
	},

	vuex: {
		actions: {
			loadFormat,
		},

		getters: {
			allStories: state => state.story.stories,
			formatNames: state => state.storyFormat.formats.map(
				format => format.name
			)
		}
	},

	components: {
		'format-item': require('./item'),
		'modal-dialog': require('../../ui/modal-dialog')
	}
});

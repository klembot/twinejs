// A drop-down menu with miscellaneous editing options for a story.

const _ = require('underscore');
const Vue = require('vue');
const FormatDialog = require('../../../dialogs/story-format');
const JavaScriptEditor = require('../../../editors/javascript');
const StatsDialog = require('../../../dialogs/story-stats');
const StoryFormatCollection = require('../../../data/collections/story-format');
const StylesheetEditor = require('../../../editors/stylesheet');
const backboneModel = require('../../../vue/mixins/backbone-model');
const locale = require('../../../locale');
const { prompt } = require('../../../dialogs/prompt');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: ['model', 'collection'],

	data: () => ({
		name: '',
		snapToGrid: true
	}),

	methods: {
		editScript() {
			new JavaScriptEditor({ model: this.story }).$mountTo(document.body);
		},

		editStyle() {
			new StylesheetEditor({ model: this.story }).$mountTo(document.body);
		},

		renameStory() {
			prompt({
				message:
					locale.say(
						'What should &ldquo;%s&rdquo; be renamed to?',
						_.escape(this.name)
					),
				buttonLabel:
					'<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				defaultText:
					this.name,
				blankTextError:
					locale.say('Please enter a name.')
			})
			.then((text) => this.name = text);
		},

		proofStory() {
			this.$dispatch('story-proof');
		},

		publishStory() {
			this.$dispatch('story-publish');
		},

		storyStats() {
			new StatsDialog({
				data: {
					story: this.story,
					passages: this.passages
				}
			}).$mountTo(document.body);
		},

		changeFormat() {
			new FormatDialog({
				data: {
					story: this.story,
					formats: StoryFormatCollection.all().models
				}
			}).$mountTo(document.body);
		},

		toggleSnap() {
			this.snapToGrid = !this.snapToGrid;
		}
	},

	components: {
		'drop-down': require('../../../ui/drop-down')
	},

	mixins: [backboneModel]
});

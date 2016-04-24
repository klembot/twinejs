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

	data: () => ({
		snapToGrid: true
	}),

	props: ['model', 'parentView'],

	methods: {
		editScript() {
			new JavaScriptEditor({ model: this.model }).$mountTo(document.body);
		},

		editStyle() {
			new StylesheetEditor({ model: this.model }).$mountTo(document.body);
		},

		renameStory() {
			prompt({
				message:
					locale.say(
						'What should &ldquo;%s&rdquo; be renamed to?',
						_.escape(this.model.get('name'))
					),
				buttonLabel:
					'<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				defaultText:
					this.model.get('name'),
				blankTextError:
					locale.say('Please enter a name.')
			})
			.then((text) => this.model.save({ name: text }));
		},

		proofStory() {
			this.parentView.proof();
		},

		publishStory() {
			this.parentView.publish();
		},

		storyStats() {
			new StatsDialog({
				data: {
					story: this.model,
					passages: this.parentView.collection
				}
			}).$mountTo(document.body);
		},

		changeFormat() {
			new FormatDialog({
				data: {
					story: this.model,
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

// A drop-down menu with miscellaneous editing options for a story.

const { escape } = require('underscore');
const Vue = require('vue');
const FormatDialog = require('../../../dialogs/story-format');
const JavaScriptEditor = require('../../../editors/javascript');
const StatsDialog = require('../../../dialogs/story-stats');
const StylesheetEditor = require('../../../editors/stylesheet');
const locale = require('../../../locale');
const { prompt } = require('../../../dialogs/prompt');
const { updateStory } = require('../../../data/actions');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	methods: {
		editScript() {
			// We have to manually inject the Vuex store, since the editors are
			// mounted outside the app scope.

			new JavaScriptEditor({
				data: { story: this.story },
				store: this.$store
			}).$mountTo(document.body);
		},

		editStyle() {
			new StylesheetEditor({
				data: { story: this.story },
				store: this.$store
			}).$mountTo(document.body);
		},

		renameStory() {
			prompt({
				message:
					locale.say(
						'What should &ldquo;%s&rdquo; be renamed to?',
						escape(this.story.name)
					),
				buttonLabel:
					'<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				defaultText:
					this.story.name,
				blankTextError:
					locale.say('Please enter a name.')
			})
			.then(text => this.updateStory(this.story.id, { name: text }));
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
					story: this.story
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
			this.updateStory(
				this.story.id,
				{ snapToGrid: !this.story.snapToGrid }
			);
		}
	},

	components: {
		'drop-down': require('../../../ui/drop-down')
	},

	vuex: {
		actions: {
			updateStory
		}
	}
});

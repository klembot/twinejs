// Handles the cog menu for a single story.

const escape = require('lodash.escape');
const Vue = require('vue');
const {confirm} = require('../../../dialogs/confirm');
const {
	deleteStory,
	duplicateStory,
	updateStory
} = require('../../../data/actions/story');
const {loadFormat} = require('../../../data/actions/story-format');
const {playStory, testStory} = require('../../../common/launch-story');
const {prompt} = require('../../../dialogs/prompt');
const locale = require('../../../locale');
const {publishStoryWithFormat} = require('../../../data/publish');
const save = require('../../../file/save');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	components: {
		'drop-down': require('../../../ui/drop-down')
	},

	methods: {
		/**
		 Plays this story in a new tab.

		 @method play
		**/

		play() {
			playStory(this.story.id);
		},

		/**
		 Tests this story in a new tab.

		 @method test
		**/

		test() {
			testStory(this.story.id);
		},

		/**
		 Downloads the story to a file.

		 @method publish
		**/

		publish() {
			this.loadFormat(
				this.story.storyFormat,
				this.story.storyFormatVersion
			).then(format => {
				save(
					publishStoryWithFormat(this.appInfo, this.story, format),
					this.story.name + '.html'
				);
			});
		},

		/**
		 Shows a confirmation before deleting the model.

		 @method confirmDelete
		**/

		delete() {
			confirm({
				message: locale.say(
					'Are you sure you want to delete &ldquo;%s&rdquo;? ' +
						'This cannot be undone.',
					escape(this.story.name)
				),
				buttonLabel:
					'<i class="fa fa-trash-o"></i> ' +
					locale.say('Delete Forever'),
				buttonClass: 'danger'
			}).then(() => this.deleteStory(this.story.id));
		},

		/**
		 Prompts the user for a new name for the story, then saves it.

		 @method rename
		**/

		rename() {
			prompt({
				message: locale.say(
					'What should &ldquo;%s&rdquo; be renamed to?',
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				response: this.story.name,
				blankTextError: locale.say('Please enter a name.')
			}).then(name => this.updateStory(this.story.id, {name}));
		},

		/**
		 Prompts the user for a name, then creates a duplicate version of this
		 story accordingly.
		**/

		duplicate() {
			prompt({
				message: locale.say('What should the duplicate be named?'),
				buttonLabel:
					'<i class="fa fa-copy"></i> ' + locale.say('Duplicate'),
				response: locale.say('%s Copy', this.story.name),
				blankTextError: locale.say('Please enter a name.')
			}).then(name => {
				this.duplicateStory(this.story.id, name);
			});
		}
	},

	vuex: {
		actions: {
			deleteStory,
			duplicateStory,
			loadFormat,
			updateStory
		},

		getters: {
			allFormats: state => state.storyFormat.formats,
			appInfo: state => state.appInfo,
			defaultFormat: state => state.pref.defaultFormat
		}
	}
});

// The side toolbar of a story list.

const Vue = require('vue');
const AboutDialog = require('../../dialogs/about');
const FormatsDialog = require('../../dialogs/formats');
const ImportDialog = require('../../dialogs/story-import');
const { createStory } = require('../../data/actions/story');
const locale = require('../../locale');
const { prompt } = require('../../dialogs/prompt');
const { publishArchive } = require('../../data/publish');
const saveFile = require('../../file/save');

module.exports = Vue.extend({
	template: require('./index.html'),

	computed: {
		newStoryTitle() {
			return locale.say('Create a brand-new story');
		},
		importFileTitle() {
			return locale.say('Import a published story or Twine archive');
		},
		saveArchiveTitle() {
			return locale.say('Save all stories to a Twine archive file');
		},
		showFormatsTitle() {
			return locale.say('Work with story and proofing formats');
		},
		changeLocaleTitle() {
			return locale.say('Change the language Twine uses');
		},
		helpTitle() {
			return locale.say('Browse online help');
		}
	},

	methods: {
		createStoryPrompt(e) {
			// Prompt for the new story name.

			prompt({
				message: locale.say(
					'What should your story be named?<br>(You can change this later.)'
				),
				buttonLabel: '<i class="fa fa-plus"></i> ' + locale.say('Add'),
				buttonClass: 'create',
				validator: name => {
					if (this.existingStories.find(
							story => story.name === name
						)) {
						return locale.say(
							'A story with this name already exists.'
						);
					}
				},

				origin: e.target
			}).then(name => {
				this.createStory({ name });

				/* Allow the appearance animation to complete. */

				window.setTimeout(() => {
					this.$dispatch(
						'story-edit',
						this.existingStories.find(
							story => story.name === name
						).id
					);
				}, 300);
			});
		},

		importFile(e) {
			new ImportDialog({
				store: this.$store,
				data: { origin: e.target }
			}).$mountTo(document.body);
		},

		saveArchive() {
			const timestamp = new Date().toLocaleString().replace(/[\/:\\]/g, '.');

			saveFile(
				publishArchive(this.existingStories, this.appInfo),
				`${timestamp} ${locale.say('Twine Archive.html')}`
			);
		},

		showAbout(e) {
			new AboutDialog({
				store: this.$store,
				data: { origin: e.target }
			}).$mountTo(document.body);
		},

		showFormats(e) {
			new FormatsDialog({
				store: this.$store,
				data: { origin: e.target }
			}).$mountTo(document.body);
		},

		showHelp() {
			window.open('https://twinery.org/2guide');
		},

		showLocale() {
			window.location.hash = 'locale';
		}
	},

	components: {
		'quota-gauge': require('../../ui/quota-gauge'),
		'theme-switcher': require('./theme-switcher')
	},

	vuex: {
		actions: {
			createStory
		},

		getters: {
			appInfo: state => state.appInfo,
			existingStories: state => state.story.stories
		}
	}
});

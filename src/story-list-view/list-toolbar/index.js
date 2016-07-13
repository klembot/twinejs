// The side toolbar of a story list.

const Vue = require('vue');
const AboutDialog = require('../../dialogs/about');
const FormatsDialog = require('../../dialogs/formats');
const ImportDialog = require('../../dialogs/story-import');
const { createStory } = require('../../data/actions');
const locale = require('../../locale');
const { prompt } = require('../../dialogs/prompt');
const { publishArchive } = require('../../data/publish');
const saveFile = require('../../file/save');

module.exports = Vue.extend({
	template: require('./index.html'),

	computed: {
		version() {
			return this.$router.app.version;
		}
	},

	methods: {
		createStoryPrompt() {
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
				}
			}).then(name => this.createStory({ name }));
		},

		importFile() {
			new ImportDialog({ store: this.$store }).$mountTo(document.body);
		},

		saveArchive() {
			const timestamp = new Date().toLocaleString().replace(/[\/:\\]/g, '.');

			saveFile(
				publishArchive(this.stories),
				`${timestamp} ${locale.say('Twine Archive.html')}`
			);
		},

		showAbout() {
			new AboutDialog().$mountTo(document.body);
		},

		showFormats() {
			new FormatsDialog({ store: this.$store }).$mountTo(document.body);
		},

		showHelp() {
			window.open('https://twinery.org/2guide');
		},

		showLocale() {
			window.location.hash = 'locale';
		}
	},

	components: {
		'quota-gauge': require('../../ui/quota-gauge')
	},

	vuex: {
		actions: {
			createStory
		},

		getters: {
			existingStories: state => state.story.stories
		}
	}
});

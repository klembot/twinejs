// The side toolbar of a story list.

const Vue = require('vue');
const locale = require('../../locale');
const AboutDialog = require('../../dialogs/about');
const FormatsDialog = require('../../dialogs/formats');
const ImportDialog = require('../../dialogs/story-import');
const { prompt } = require('../../dialogs/prompt');
const publish = require('../../story-publish');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: ['collection'],

	computed: {
		version() {
			return this.$router.app.version;
		}
	},

	methods: {
		createStory() {
			// Prompt for the new story name.

			prompt({
				message: locale.say(
					'What should your story be named?<br>(You can change this later.)'
				),
				buttonLabel: '<i class="fa fa-plus"></i> ' + locale.say('Add'),
				buttonClass: 'create',
				validator: name => {
					if (this.collection.findWhere({ name })) {
						return locale.say(
							'A story with this name already exists.'
						);
					}
				}
			}).then((name) => {
				// Broadcast a create event. The parent view will take care of
				// automatically editing the new story for us.

				this.$nextTick(() =>
					this.$dispatch('collection-create', { name })
				);
			});
		},

		importFile() {
			let importDialog = new ImportDialog({
				data: {
					storyCollection: this.collection
				}
			});
			
			importDialog.$mountTo(document.body);
		},

		saveArchive() {
			publish.saveArchive();
		},

		showAbout() {
			new AboutDialog().$mountTo(document.body);
		},

		showFormats() {
			new FormatsDialog().$mountTo(document.body);
		},

		showHelp() {
			window.open('http://twinery.org/2guide');
		},

		showLocale() {
			window.location.hash = 'locale';
		}
	},

	components: {
		'quota-gauge': require('../../ui/quota-gauge')
	}
});

// The side toolbar of a story list.

const Vue = require("vue");
const AboutDialog = require("../../dialogs/about");
const ImportDialog = require("../../dialogs/story-import");
const FormatsDialog = require("../../dialogs/formats");
const { createStory } = require("../../data/actions/story");
const locale = require("../../locale");
const { publishArchive } = require("../../data/publish");
const eventHub = require("../../common/eventHub");
const saveFile = require("../../file/save");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	computed: {
		newStoryTitle() {
			return locale.say("Create a brand-new story");
		},
		importFileTitle() {
			return locale.say("Import a published story or Twine archive");
		},
		saveArchiveTitle() {
			return locale.say("Save all stories to a Twine archive file");
		},
		showFormatsTitle() {
			return locale.say("Work with story and proofing formats");
		},
		changeLocaleTitle() {
			return locale.say("Change the language Twine uses");
		},
		helpTitle() {
			return locale.say("Browse online help");
		},
		promptMessage() {
			return locale.say(
				"What should your story be named?<br>(You can change this later.)"
			);
		},
		promptButtonLabel() {
			return '<i class="fa fa-plus"></i> ' + locale.say("Add");
		}
	},

	methods: {
		createStoryPrompt(e) {
			eventHub.$once("close", name => {
				if (!name) {
					return;
				}
				this.createStory({ name });

				// Allow the appearance animation to complete.

				window.setTimeout(() => {
					eventHub.$emit(
						"story-edit",
						this.existingStories.find(story => story.name === name).id
					);
				}, 300);
			});
			const promptValidator = name => {
				if (this.existingStories.find(story => story.name === name)) {
					return locale.say("A story with this name already exists.");
				}
			};
			const promptArgs = {
				buttonLabel: this.promptButtonLabel,
				class: this.promptButtonClass,
				validator: promptValidator,
				origin: e.target,
				message: this.promptMessage
			};

			eventHub.$emit("modalPrompt", promptArgs);
		},

		importFile(e) {
			this.$emit("customModal", ImportDialog, { origin: e.target });
		},

		saveArchive() {
			const timestamp = new Date().toLocaleString().replace(/[\/:\\]/g, ".");

			saveFile(
				publishArchive(this.existingStories, this.appInfo),
				`${timestamp} ${locale.say("Twine Archive.html")}`
			);
		},

		showAbout(e) {
			this.$emit("customModal", AboutDialog, { origin: e.target });
		},

		showFormats(e) {
			this.$emit("customModal", FormatsDialog, { origin: e.target });
		},

		showHelp() {
			window.open("https://twinery.org/2guide");
		},

		showLocale() {
			this.$router.push("locale");
		}
	},

	components: {
		"quota-gauge": require("../../ui/quota-gauge"),
		"theme-switcher": require("./theme-switcher")
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

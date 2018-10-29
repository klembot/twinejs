// A drop-down menu with miscellaneous editing options for a story.

const escape = require("lodash.escape");
const Vue = require("vue");
const FormatDialog = require("../../../dialogs/story-format");
const JavaScriptEditor = require("../../../editors/javascript");
const StatsDialog = require("../../../dialogs/story-stats");
const StylesheetEditor = require("../../../editors/stylesheet");
const { loadFormat } = require("../../../data/actions/story-format");
const locale = require("../../../locale");
const eventHub = require("../../../common/eventHub");
const { publishStoryWithFormat } = require("../../../data/publish");
const save = require("../../../file/save");
const { selectPassages } = require("../../../data/actions/passage");
const { updateStory } = require("../../../data/actions/story");

module.exports = Vue.extend({
	template: require("./index.html"),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	methods: {
		editScript(e) {
			eventHub.$emit("customModal", JavaScriptEditor, {
				storyId: this.story.id,
				origin: e.target
			});
		},

		editStyle(e) {
			eventHub.$emit("customModal", StylesheetEditor, {
				storyId: this.story.id,
				origin: e.target
			});
		},

		renameStory(e) {
			eventHub.$once("close", text =>
				this.updateStory(this.story.id, { name: text })
			);
			eventHub.$emit("modalPrompt", {
				message: locale.say(
					"What should &ldquo;%s&rdquo; be renamed to?",
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + locale.say("Rename"),
				response: this.story.name,
				blankTextError: locale.say("Please enter a name."),
				origin: e.target
			});
		},

		selectAll() {
			this.selectPassages(this.story.id, () => true);
		},

		proofStory() {
			window.open(
				"#!/stories/" + this.story.id + "/proof",
				"twinestory_proof_" + this.story.id
			);
		},

		publishStory() {
			this.loadFormat(
				this.story.storyFormat,
				this.story.storyFormatVersion
			).then(format => {
				save(
					publishStoryWithFormat(this.appInfo, this.story, format),
					this.story.name + ".html"
				);
			});
		},

		storyStats(e) {
			console.warn("story-menu stats dialog usinig $mountTo");
			new StatsDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store
			}).$mountTo(document.body);
		},

		changeFormat(e) {
			console.warn("story-menu change format usinig $mountTo");
			new FormatDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store
			}).$mountTo(document.body);
		},

		toggleSnap() {
			this.updateStory(this.story.id, { snapToGrid: !this.story.snapToGrid });
		}
	},

	components: {
		"drop-down": require("../../../ui/drop-down")
	},

	vuex: {
		actions: {
			loadFormat,
			selectPassages,
			updateStory
		},

		getters: {
			allFormats: state => state.storyFormat.formats,
			appInfo: state => state.appInfo,
			defaultFormatName: state => state.pref.defaultFormat
		}
	}
});

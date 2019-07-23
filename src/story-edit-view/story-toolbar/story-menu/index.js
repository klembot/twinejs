// A drop-down menu with miscellaneous editing options for a story.

const escape = require('lodash.escape');
const Vue = require('vue');
const FormatDialog = require('../../../dialogs/story-format');
const JavaScriptEditor = require('../../../editors/javascript');
const StatsDialog = require('../../../dialogs/story-stats');
const StylesheetEditor = require('../../../editors/stylesheet');
const {loadFormat} = require('../../../data/actions/story-format');
const locale = require('../../../locale');
const eventHub = require('../../../common/eventHub');
const {proofStory} = require('../../../common/launch-story');
const {publishStoryWithFormat} = require('../../../data/publish');
const save = require('../../../file/save');
const {selectPassages} = require('../../../data/actions/passage');
const {updateStory} = require('../../../data/actions/story');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	methods: {
		editScript(e) {
			eventHub.$emit('customModal', JavaScriptEditor, {
				storyId: this.story.id,
				origin: e.target
			});
		},

		editStyle(e) {
			eventHub.$emit('customModal', StylesheetEditor, {
				storyId: this.story.id,
				origin: e.target
			});
		},

		renameStory(e) {
			eventHub.$once('close', (isError, text) => {
				if (isError) {
					return;
				}
				this.updateStory(this.story.id, { name: text });
			});
			eventHub.$emit('modalPrompt', {
				message: locale.say(
					'What should “%s” be renamed to?',
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				response: this.story.name,
				blankTextError: locale.say('Please enter a name.'),
				origin: e.target
			});
		},

		selectAll() {
			this.selectPassages(this.story.id, () => true);
		},

		proofStory() {
			proofStory(this.$store, this.story.id);
		},

		publishStory() {
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

		storyStats(e) {
			eventHub.$emit('customModal', StatsDialog, {
				storyId: this.story.id,
				origin: e.target
			});
		},

		changeFormat(e) {
			eventHub.$emit('customModal', FormatDialog, {
				storyId: this.story.id,
				origin: e.target
			});
		},

		toggleSnap() {
			this.updateStory(this.story.id, { snapToGrid: !this.story.snapToGrid });
		}
	},

	components: {
		'drop-down': require('../../../ui/drop-down')
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

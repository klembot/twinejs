/* A drop-down menu with miscellaneous editing options for a story.*/

import escape from 'lodash.escape';
import Vue from 'vue';
import dropDown from '../../../ui/drop-down';
import FormatDialog from '../../../dialogs/story-format';
import JavaScriptEditor from '../../../editors/javascript';
import StatsDialog from '../../../dialogs/story-stats';
import StylesheetEditor from '../../../editors/stylesheet';
import {loadFormat} from '../../../data/actions/story-format';
import eventHub from '../../../common/eventHub';
import {proofStory} from '../../../common/launch-story';
import {publishStoryWithFormat} from '../../../data/publish';
import save from '../../../file/save';
import {say} from '../../../locale';
import {selectPassages} from '../../../data/actions/passage';
import {updateStory} from '../../../data/actions/story';
import template from './index.html';

export default Vue.extend({
	template,
	props: {
		story: {type: Object, required: true}
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
				this.updateStory(this.story.id, {name: text});
			});
			eventHub.$emit('modalPrompt', {
				message: say(
					'What should “%s” be renamed to?',
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + say('Rename'),
				response: this.story.name,
				blankTextError: say('Please enter a name.'),
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
			this.updateStory(this.story.id, {
				snapToGrid: !this.story.snapToGrid
			});
		}
	},
	components: {
		'drop-down': dropDown
	},
	vuex: {
		actions: {loadFormat, selectPassages, updateStory},
		getters: {
			allFormats: state => state.storyFormat.formats,
			appInfo: state => state.appInfo,
			defaultFormatName: state => state.pref.defaultFormat
		}
	}
});

/* Handles the cog menu for a single story. */

import escape from 'lodash.escape';
import Vue from 'vue';
import eventHub from '../../../common/eventHub';
import {
	deleteStory,
	duplicateStory,
	updateStory
} from '../../../data/actions/story';
import dropDown from '../../../ui/drop-down';
import {loadFormat} from '../../../data/actions/story-format';
import {playStory, testStory} from '../../../common/launch-story';
import {publishStoryWithFormat} from '../../../data/publish';
import {say} from '../../../locale';
import save from '../../../file/save';
import store from '../../../data/store';
import template from './index.html';

export default Vue.extend({
	template,
	props: {
		story: {type: Object, required: true}
	},
	components: {
		'drop-down': dropDown
	},
	methods: {
		/*
		Plays this story in a new tab.
		*/

		play() {
			playStory(store, this.story.id);
		},

		/*
		Tests this story in a new tab.
		*/

		test() {
			testStory(store, this.story.id);
		},

		/*
		Downloads the story to a file.
		*/

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

		/*
		Shows a confirmation before deleting the model.
		*/

		deleteClick() {
			eventHub.$once('close', confirmed => {
				if (confirmed) {
					this.deleteStory(this.story.id);
				}
			});
			eventHub.$emit('modalConfirm', {
				message: say(
					'Are you sure you want to delete “%s”? ' +
						'This cannot be undone.',
					escape(this.story.name)
				),
				buttonLabel:
					'<i class="fa fa-trash-o"></i> ' + say('Delete Forever'),
				buttonClass: 'danger'
			});
		},

		/*
		Prompts the user for a new name for the story, then saves it.
		*/

		rename() {
			eventHub.$once('close', (isError, name) => {
				if (isError) {
					return;
				}
				this.updateStory(this.story.id, {name});
			});
			eventHub.$emit('modalPrompt', {
				message: say(
					'What should “%s” be renamed to?',
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + say('Rename'),
				response: this.story.name,
				blankTextError: say('Please enter a name.')
			});
		},

		/*
		Prompts the user for a name, then creates a duplicate version of this
		story accordingly.
		*/

		duplicate() {
			eventHub.$once('close', name => {
				if (name) {
					this.duplicateStory(this.story.id, name);
				}
			});
			eventHub.$emit('modalPrompt', {
				message: say('What should the duplicate be named?'),
				buttonLabel: '<i class="fa fa-copy"></i> ' + say('Duplicate'),
				response: say('%s Copy', this.story.name),
				blankTextError: say('Please enter a name.')
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

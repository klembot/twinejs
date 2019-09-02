/* The side toolbar of a story list. */

import Vue from 'vue';
import AboutDialog from '../../dialogs/about';
import FormatsDialog from '../../dialogs/formats';
import ImportDialog from '../../dialogs/story-import';
import {createStory} from '../../data/actions/story';
import {publishArchive} from '../../data/publish';
import eventHub from '../../common/eventHub';
import quotaGauge from '../../ui/quota-gauge';
import saveFile from '../../file/save';
import {say} from '../../locale';
import themeSwitcher from './theme-switcher';
import template from './index.html';
import './index.less';

export default Vue.extend({
	template,
	computed: {
		newStoryTitle() {
			return say('Create a brand-new story');
		},
		importFileTitle() {
			return say('Import a published story or Twine archive');
		},
		saveArchiveTitle() {
			return say('Save all stories to a Twine archive file');
		},
		showFormatsTitle() {
			return say('Work with story and proofing formats');
		},
		changeLocaleTitle() {
			return say('Change the language Twine uses');
		},
		helpTitle() {
			return say('Browse online help');
		},
		promptMessage() {
			return say(
				'What should your story be named?<br>(You can change this later.)'
			);
		},
		promptButtonLabel() {
			return '<i class="fa fa-plus"></i> ' + say('Add');
		}
	},
	methods: {
		createStoryPrompt(e) {
			eventHub.$once('close', (isError, name) => {
				if (isError) {
					return;
				}
				this.createStory({name});

				/* Allow the appearance animation to complete. */

				window.setTimeout(() => {
					eventHub.$emit(
						'story-edit',
						this.existingStories.find(story => story.name === name).id
					);
				}, 300);
			});
			const promptValidator = name => {
				if (this.existingStories.find(story => story.name === name)) {
					return say('A story with this name already exists.');
				}
			};
			const promptArgs = {
				buttonLabel: this.promptButtonLabel,
				class: this.promptButtonClass,
				validator: promptValidator,
				origin: e.target,
				message: this.promptMessage
			};

			eventHub.$emit('modalPrompt', promptArgs);
		},
		importFile(e) {
			this.$emit('customModal', ImportDialog, {origin: e.target});
		},
		saveArchive() {
			const timestamp = new Date().toLocaleString().replace(/[\/:\\]/g, '.');

			saveFile(
				publishArchive(this.existingStories, this.appInfo),
				`${timestamp} ${say('Twine Archive.html')}`
			);
		},
		showAbout(e) {
			this.$emit('customModal', AboutDialog, {origin: e.target});
		},
		showFormats(e) {
			this.$emit('customModal', FormatsDialog, {origin: e.target});
		},
		showHelp() {
			window.open('https://twinery.org/2guide');
		},
		showLocale() {
			this.$router.push('locale');
		}
	},
	components: {
		'quota-gauge': quotaGauge,
		'theme-switcher': themeSwitcher
	},
	vuex: {
		actions: {createStory},
		getters: {
			appInfo: state => state.appInfo,
			existingStories: state => state.story.stories
		}
	}
});

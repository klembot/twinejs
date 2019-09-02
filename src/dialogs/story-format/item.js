/*
Shows a single story format, with a radio button to allow the user to
choose it.
*/

import Vue from 'vue';
import {say} from '../../locale';
import {updateStory} from '../../data/actions/story';
import template from './item.html';
import './item.less';

export default Vue.extend({
	template,
	props: {
		story: {
			type: Object,
			required: true
		},

		format: {
			type: Object,
			required: true
		}
	},
	computed: {
		selected() {
			return (
				this.story.storyFormat === this.format.name &&
				this.story.storyFormatVersion === this.format.version
			);
		},

		nameVersion() {
			return this.format.name + '-' + this.format.properties.version;
		},
		author() {
			if (this.format.properties.author) {
				/* L10n: %s is the name of an author. */
				return say('by %s', this.format.properties.author);
			}

			return '';
		},

		/*
		Calculates the image source relative to the format's path.
		*/

		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');

			return path + '/' + this.format.properties.image;
		}
	},
	methods: {
		select() {
			this.updateStory(this.story.id, {
				storyFormat: this.format.name,
				storyFormatVersion: this.format.version
			});
		}
	},
	vuex: {
		actions: {
			updateStory
		}
	}
});

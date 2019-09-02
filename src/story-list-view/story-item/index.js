/*
An individual item in the list managed by StoryListView.  This offers quick
links for editing, playing, and deleting a story; StoryEditView handles more
detailed changes.
*/

import moment from 'moment';
import Vue from 'vue';
import eventHub from '../../common/eventHub';
import itemMenu from './item-menu';
import itemPreview from './item-preview';
import template from './index.html';
import './index.less';

export default Vue.extend({
	template,
	props: {
		story: {type: Object, required: true}
	},
	components: {
		'item-preview': itemPreview,
		'item-menu': itemMenu
	},
	computed: {
		lastUpdateFormatted() {
			return moment(this.story.lastUpdate).format('lll');
		},

		hue() {
			// A hue based on the story's name.

			if (typeof this.story.name != 'string') {
				return 90;
			}
			return (
				([this.story.name].reduce(
					(hue, char) => hue + char.charCodeAt(0),
					0
				) %
					40) *
				90
			);
		}
	},
	created: function() {
		/*
		If our parent wants to edit our own model, then we do so. This is
		done this level so that we animate the transition correctly.
		*/

		eventHub.$on('story-edit', id => {
			if (this.story.id === id) {
				this.edit();
			}
		});
	},
	methods: {
		/*
		Opens a StoryEditView for this story.
		*/

		edit() {
			this.$router.push({path: '/stories/' + this.story.id});
		}
	}
});

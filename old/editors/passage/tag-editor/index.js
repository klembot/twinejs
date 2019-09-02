/* An editor for adding and removing tags from a passage. */

import Vue from 'vue';
import uniq from 'lodash.uniq';
import {say} from '../../../locale';
import tagMenu from './tag-menu';
import {updatePassage} from '../../../data/actions/passage';
import template from './index.html';

export default Vue.extend({
	data: () => ({
		newVisible: false
	}),
	computed: {
		tagColors() {
			return this.allStories.find(s => s.id === this.storyId).tagColors;
		},
		addTagPlaceholder() {
			return say('Tag name');
		}
	},
	props: {
		passage: {
			type: Object,
			required: true
		},
		storyId: {
			type: String,
			required: true
		}
	},
	template,
	methods: {
		showNew() {
			this.newVisible = true;
			this.$nextTick(() => this.$refs.newName.focus());
		},
		hideNew() {
			this.newVisible = false;
		},
		addNew() {
			const newName = this.$refs.newName.value.replace(/\s/g, '-');

			/* Clear the newName element while it's transitioning out. */

			this.$refs.newName.value = '';

			this.updatePassage(this.storyId, this.passage.id, {
				tags: uniq([].concat(this.passage.tags, newName))
			});

			this.hideNew();
		}
	},
	vuex: {
		getters: {
			allStories: state => state.story.stories
		},
		actions: {updatePassage}
	},
	components: {
		'tag-menu': tagMenu
	}
});

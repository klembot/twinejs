/*
A component showing a single search result.
*/

import Vue from 'vue';
import eventHub from '../../common/eventHub';
import {say} from '../../locale';
import {updatePassage} from '../../data/actions/passage';
import template from './result.html';
import './result.less';

export default Vue.extend({
	template,
	props: {
		story: {
			type: Object,
			required: true
		},
		match: {
			type: Object,
			required: true
		},
		searchRegexp: {
			type: RegExp,
			required: true
		},
		replaceWith: {
			type: String,
			required: true
		},
		searchNames: {
			type: Boolean,
			require: true
		}
	},
	computed: {
		replaceTitle() {
			return say('Replace in Passage');
		}
	},
	data: () => ({
		expanded: false
	}),
	methods: {
		toggleExpanded() {
			this.expanded = !this.expanded;
		},

		replace() {
			const name = this.searchNames
				? this.match.passage.name.replace(
						this.searchRegexp,
						this.replaceWith
				  )
				: undefined;
			const text = this.match.passage.text.replace(
				this.searchRegexp,
				this.replaceWith
			);

			this.updatePassage(this.story.id, this.match.passage.id, {
				name,
				text
			});
		}
	},
	created() {
		/*
		The parent sends these events when the user chooses to expand or
		collapse all results.
		*/

		eventHub.$on('expand', () => (this.expanded = true));
		eventHub.$on('collapse', () => (this.expanded = false));
		/* The parent sends this event when the user clicks 'Replace All'. */
		eventHub.$on('replace', () => this.replace());
	},
	vuex: {
		actions: {
			updatePassage
		}
	}
});

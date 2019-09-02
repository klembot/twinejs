/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

import Vue from 'vue';
import eventHub from '../../../common/eventHub';
import {say} from '../../../locale';
import SearchDialog from '../../../dialogs/story-search';
import template from './index.html';

export default Vue.extend({
	template,
	props: {
		story: {type: Object, required: true}
	},
	data: () => ({search: ''}),
	computed: {
		quickFind() {
			return say('Quick Find');
		},
		globalFnR() {
			return say('Find and replace across the entire story');
		}
	},
	watch: {
		search() {
			/*
			Convert the entered text to regexp, escaping text, and tell our
			parent to change its highlight criteria. This is cribbed from
			https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions.
			*/

			const value = new RegExp(
				this.search.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1'),
				'i'
			);

			eventHub.$emit(
				'highlight-regexp-change',
				value.source !== '(?:)' ? value : null
			);
		}
	},
	methods: {
		showModal(e) {
			eventHub.$emit('customModal', SearchDialog, {
				story: this.story,
				search: this.search,
				origin: e.target
			});
		}
	}
});

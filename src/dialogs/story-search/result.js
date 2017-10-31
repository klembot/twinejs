/*
A component showing a single search result.
*/

const Vue = require('vue');
const { updatePassage } = require('../../data/actions/passage');

require('./result.less');

module.exports = Vue.extend({
	template: require('./result.html'),
	
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

	data: () => ({
		expanded: false
	}),

	methods: {
		toggleExpanded() {
			this.expanded = !this.expanded;
		},

		replace() {
			const name = this.searchNames ?
				this.match.passage.name.replace(
					this.searchRegexp,
					this.replaceWith
				)
				: undefined;
			const text = this.match.passage.text.replace(
				this.searchRegexp,
				this.replaceWith
			);

			this.updatePassage(
				this.story.id,
				this.match.passage.id,
				{ name, text }
			);
		}
	},

	events: {
		/*
		The parent sends these events when the user chooses to expand or
		collapse all results.
		*/

		expand() {
			this.expanded = true;
		},

		collapse() {
			this.expanded = false;
		},

		/* The parent sends this event when the user clicks "Replace All". */

		replace() {
			this.replace();
		}
	},

	vuex: {
		actions: {
			updatePassage
		}
	}
});

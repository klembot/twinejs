// A component showing a single search result.

const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./result.html'),
	
	props: ['match', 'getSearchRegexp', 'getReplace', 'getSearchNames'],

	data: () => ({
		expanded: false
	}),

	methods: {
		toggleExpanded() {
			this.expanded = !this.expanded;
		},

		replace() {
			this.match.passage.replace(
				this.getSearchRegexp(),
				this.getReplace(),
				this.getSearchNames()
			);
		}
	},

	events: {
		// The parent sends these events when the user chooses to expand or
		// collapse all results.

		expand() {
			this.expanded = true;
		},

		collapse() {
			this.expanded = false;
		},

		// The parent sends this event when the user clicks "Replace All".

		replace() {
			this.replace();
		}
	}
});

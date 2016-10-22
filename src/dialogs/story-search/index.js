/*
A modal which allows the user to perform find and replace on a array of
passages.
*/

const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		passages: [],
		search: '',
		replace: '',
		searchNames: true,
		caseSensitive: false,
		regexp: false,
		working: false,
		origin: null
	}),

	computed: {
		searchRegexp() {
			let flags = 'g';

			if (!this.caseSensitive) {
				flags += 'i';
			}

			let source = this.search;

			if (this.regexp) {
				source = source.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
			}

			return new RegExp('(' + source + ')', flags);
		},

		passageMatches() {
			if (this.search === '') {
				return [];
			}

			this.working = true;
			
			let result = this.passages.reduce((matches, passage) => {
				let numMatches = 0;
				let passageName = passage.get('name');
				let passageText = passage.get('text');
				let highlightedName = passageName;
				let highlightedText = passageText;
				let textMatches = passageText.match(this.searchRegexp);

				if (textMatches) {
					numMatches += textMatches.length;
					highlightedText = passageText.replace(
						this.searchRegexp,
						'<span class="highlight">$1</span>'
					);
				}

				if (this.searchNames) {
					let nameMatches = passageName.match(this.searchRegexp);

					if (nameMatches) {
						numMatches += nameMatches.length;
						highlightedName = passageName.replace(
							this.searchRegexp,
							'<span class="highlight">$1</span>'
						);
					}
				}

				if (numMatches > 0) {
					matches.push({
						passage,
						numMatches,
						highlightedName,
						highlightedText
					});
				}

				return matches;
			}, []);

			this.working = false;
			return result;
		}
	},

	methods: {
		expandAll() {
			this.$broadcast('expand');
		},

		collapseAll() {
			this.$broadcast('collapse');
		},

		replaceAll() {
			this.$broadcast('replace');
		},

		/*
		Getters for our child result components. These are functions so that
		although we pass them as props, they're dynamic.
		*/

		getSearchRegexp() {
			return this.searchRegexp;
		},

		getReplace() {
			return this.replace;
		},

		getSearchNames() {
			return this.searchNames;
		}
	},

	ready() {
		this.$els.search.focus();
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
		'search-result': require('./result')
	}
});

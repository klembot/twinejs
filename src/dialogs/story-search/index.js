/*
A modal which allows the user to perform find and replace on a array of
passages.
*/

const Vue = require('vue');
const escapeRegexp = require('lodash.escaperegexp');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		story: {},
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
			// source = source.replaceAll("<", "&lt");
			// source = source.replaceAll(">", "&gt");

			/*
			Escape regular expression characters in what the user typed unless
			they indicated that they're using a regexp.
			*/

			if (!this.regexp) {
				source = escapeRegexp(source);
			}

			return new RegExp('(' + source + ')', flags);
		},

		passageMatches() {
			if (this.search === '') {
				return [];
			}

			this.working = true;

			let result = this.story.passages.reduce((matches, passage) => {
				// passage.text = passage.text.replaceAll("<", "&lt");
				// passage.text = passage.text.replaceAll(">", "&gt");
				let numMatches = 0;
				let passageName = passage.name;
				let passageText = passage.text;
				passageText = passageText.replaceAll("<", "&lt;");
				passageText = passageText.replaceAll('>', "&gt;");
				passageName = passageName.replaceAll("<", "&lt;");
				passageName = passageName.replaceAll('>', "&gt;");
				let highlightedName = passageName;
				let highlightedText = passageText;

				this.search = this.search.replaceAll("<", "&lt;");
				this.search = this.search.replaceAll(">", "&gt;");
				let textMatches = passageText.match(this.searchRegexp);

				let nameMatches = passageName.match(this.searchRegexp);
				// console.log(this.search);
				// this.search = "nick";
				//console.log(this.searchRegexp); // changing what this.search is updates this.searchRegexp!

				if (textMatches) {
					numMatches += textMatches.length;
					highlightedText = passageText.replace(
						this.searchRegexp,
						'<span class="highlight">$1</span>'
					);
				}
				if (nameMatches) {
					numMatches += nameMatches.length;
					highlightedName = passageName.replace(
						this.searchRegexp,
						'<span class="highlight">$1</span>'
					);
				}

				// if (this.searchNames) {
				// 	let nameMatches = passageName.match(this.searchRegexp);

				// 	if (nameMatches) {
				// 		numMatches += nameMatches.length;
				// 		highlightedName = passageName.replace(
				// 			this.searchRegexp,
				// 			'<span class="highlight">$1</span>'
				// 		);
				// 	}
				// }

				if (numMatches > 0) {
					matches.push({
						passage,
						numMatches,
						highlightedName,
						highlightedText
					});
				}
				// this.searchRegexp = this.searchRegexp.replaceAll("&lt", "<");
				// this.searchRegexp = this.searchRegexp.replaceAll("&gt", ">");
				this.search = this.search.replaceAll("&lt;", "<");
				this.search = this.search.replaceAll("&gt;", ">");
				//console.log(this.searchRegexp);

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

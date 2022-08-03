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
				let numMatches = 0;
				let passageName = passage.name;
				let passageText = passage.text;

				/*
				Replaces HTML tags with their respective unicodes to prevent
				unwanted execution of HTML code. If unicode is present
				escape the unicode. If both are present, both can't be escaped
				so prioritize escaping HTML.
				*/
				let hasUnicodeOnly = (passageText.includes("&lt") || passageText.includes("&gt"))
				&& !(passageText.includes("<") || passageText.includes(">"));

				if (hasUnicodeOnly) {
					passageName = passageName.replaceAll("&lt", "&amp;lt").replaceAll("&gt", "&amp;gt");
					passageText = passageText.replaceAll("&lt", "&amp;lt").replaceAll("&gt", "&amp;gt");
					this.search = this.search.replaceAll("&lt", "&amp;lt").replaceAll("&gt", "&amp;gt");
				}
				else {
					passageName = passageName.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
					passageText = passageText.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
					this.search = this.search.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
				}
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
				/*
				Reverts this.search back to its original state.
				*/
				if (hasUnicodeOnly) {
					this.search = this.search.replaceAll("&amp;lt", "&lt").replaceAll("&amp;gt", "&gt");
				}
				else {
					this.search = this.search.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
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

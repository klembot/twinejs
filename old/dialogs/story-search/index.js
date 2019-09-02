/*
A modal which allows the user to perform find and replace on a array of
passages.
*/

import Vue from 'vue';
import eventHub from '../../common/eventHub';
import escapeRegexp from 'lodash.escaperegexp';
import modalDialog from '../../ui/modal-dialog';
import {say} from '../../locale';
import searchResult from './result';
import template from './index.html';
import './index.less';

export default Vue.component('SearchDialog', {
	template,
	props: ['story', 'search', 'origin'],
	data: () => ({
		replace: '',
		searchNames: true,
		caseSensitive: false,
		regexp: false,
		working: false
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
		expandButtonTitle() {
			return say('Expand all search results');
		},
		collapseButtonTitle() {
			return say('Collapse all search results');
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
			eventHub.$emit('expand');
		},
		collapseAll() {
			eventHub.$emit('collapse');
		},
		replaceAll() {
			eventHub.$emit('replace');
		}
	},
	mounted() {
		this.$nextTick(function() {
			// code that assumes this.$el is in-document
			this.$refs.search.focus();
		});
	},
	components: {
		'modal-dialog': modalDialog,
		'search-result': searchResult
	}
});

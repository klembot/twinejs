// A modal which shows aggregrate statistics for a story.

const Vue = require('vue');
const moment = require('moment');
const locale = require('../../locale');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		story: Object,
		passages: []
	}),

	computed: {
		ifid() {
			return this.story.get('ifid');
		},

		lastUpdate() {
			return moment(this.story.get('lastUpdate')).format('LLLL');
		},

		charCount() {
			return this.passages.reduce(
				(count, passage) => count + passage.get('text').length,
				0
			);
		},

		charDesc() {
			// L10n: Character in the sense of individual letters in a word.
			// This does not actually include the count, as it is used in a
			// table.
			return locale.sayPlural('Character', 'Characters', this.charCount);
		},

		wordCount() {
			// L10n: Word in the sense of individual words in a sentence.
			// This does not actually include the count, as it is used in a
			// table.
			return this.passages.reduce(
				(count, passage) => count + passage.get('text').split(/\s+/).length,
				0
			);
		},

		wordDesc() {
			// L10n: Word in the sense of individual words in a sentence.
			// This does not actually include the count, as it is used in a
			// table.
			return locale.sayPlural('Word', 'Words', this.wordCount);
		},

		links() {
			// An array of distinct link names.

			return this.passages.reduce(
				(links, passage) => [
					...links,
					...passage.links().filter(
						(link) => links.indexOf(link) === -1
					)
				],
				[]
			);
		},

		passageNames() {
			return this.passages.map((passage) => passage.get('name'));
		},

		linkCount() {
			// This counts repeated links, unlike links().

			return this.passages.reduce(
				(count, passage) => count + passage.links().length,
				0
			);
		},
		
		linkDesc() {
			// L10n: Links in the sense of hypertext links.
			// This does not actually include the count, as it is used in a
			// table.
			return locale.sayPlural('Link', 'Links', this.linkCount);
		},

		brokenLinkCount() {
			return this.links.filter(
				(link) => this.passageNames.indexOf(link) === -1
			).length;
		},

		brokenLinkDesc() {
			// L10n: Links in the sense of hypertext links.
			// This does not actually include the count, as it is used in a
			// table.
			return locale.sayPlural(
				'Broken Link',
				'Broken Links',
				this.brokenLinkCount
			);
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	}
});

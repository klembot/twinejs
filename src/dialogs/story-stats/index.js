/*
A modal which shows aggregrate statistics for a story.
*/

const Vue = require('vue');
const moment = require('moment');
const linkParser = require('../../data/link-parser');
const locale = require('../../locale');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storyId: '',
		origin: null
	}),

	computed: {
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		lastUpdate() {
			return moment(this.story.lastUpdate).format('LLLL');
		},

		charCount() {
			return this.story.passages.reduce(
				(count, passage) => count + passage.text.length,
				0
			);
		},

		charDesc() {
			/*
			L10n: Character in the sense of individual letters in a word.  This
			does not actually include the count, as it is used in a table.
			*/
			return locale.sayPlural('Character', 'Characters', this.charCount);
		},

		wordCount() {
			return this.story.passages.reduce(
				(count, passage) => count + passage.text.split(/\s+/).length,
				0
			);
		},

		wordDesc() {
			/*
			L10n: Word in the sense of individual words in a sentence.  This
			does not actually include the count, as it is used in a table.
			*/
			return locale.sayPlural('Word', 'Words', this.wordCount);
		},

		links() {
			/* An array of distinct link names. */

			return this.story.passages.reduce(
				(links, passage) => [
					...links,
					...linkParser(passage.text).filter(
						link => links.indexOf(link) === -1
					)
				],
				[]
			);
		},

		passageNames() {
			return this.story.passages.map(passage => passage.name);
		},

		passageCount() {
			return this.story.passages.length;
		},

		passageDesc() {
			/*
			L10n: Word in the sense of individual words in a sentence.
			This does not actually include the count, as it is used in a
			table.
			*/
			return locale.sayPlural('Passage', 'Passages', this.passageCount);
		},

		linkCount() {
			/* This counts repeated links, unlike links(). */

			return this.story.passages.reduce(
				(count, passage) => count + linkParser(passage.text).length,
				0
			);
		},
		
		linkDesc() {
			/*
			L10n: Links in the sense of hypertext links.
			This does not actually include the count, as it is used in a
			table.
			*/
			return locale.sayPlural('Link', 'Links', this.linkCount);
		},

		brokenLinkCount() {
			return this.links.filter(
				link => this.passageNames.indexOf(link) === -1
			).length;
		},

		brokenLinkDesc() {
			/*
			L10n: Links in the sense of hypertext links.
			This does not actually include the count, as it is used in a
			table.
			*/
			return locale.sayPlural(
				'Broken Link',
				'Broken Links',
				this.brokenLinkCount
			);
		}
	},

	vuex: {
		getters: {
			allStories: state => state.story.stories
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	}
});

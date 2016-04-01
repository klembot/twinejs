/**
 Shows statistics about the story being edited.

 @class StatsModal
 @extends Backbone.View
**/

'use strict';
const _ = require('underscore');
const Backbone = require('backbone');
const locale = require('../../locale');

module.exports = Backbone.View.extend({
	initialize(options) {
		this.parent = options.parent;
	},

	/**
	 Opens the modal dialog.

	 @method open
	**/

	open() {
		// calculate counts

		let charCount = 0;
		let wordCount = 0;
		let passageCount = 0;
		let linkCount = 0;
		let brokenLinkCount = 0;
		const passageLinks = {};
		const passageNames = [];

		_.each(this.parent.collection.models, passage => {
			passageCount++;
			const text = passage.get('text');

			charCount += text.length;
			wordCount += text.split(/\s+/).length;
			const links = passage.links();

			linkCount += links.length;
			passageNames.push(passage.get('name'));

			_.each(links, link => {
				passageLinks[link] = (passageLinks[link] || 0) + 1;
			});
		});

		// we calculate broken links now that we have
		// a complete list of names

		_.each(passageLinks, (count, name) => {
			if (passageNames.indexOf(name) == -1) {
				brokenLinkCount += count;
			}
		});

		this.$('.charCount').text(charCount.toLocaleString());
		this.$('.wordCount').text(wordCount.toLocaleString());
		this.$('.passageCount').text(passageCount.toLocaleString());
		this.$('.linkCount').text(linkCount.toLocaleString());
		this.$('.brokenLinkCount').text(brokenLinkCount.toLocaleString());

		// L10n: Character in the sense of individual letters in a word.
		// This does not actually show the count here, as it is used in a table.
		this.$('.charDesc').text(
			locale.sayPlural('Character', 'Characters', charCount)
		);

		// L10n: Word in the sense of individual words in a sentence.
		// This does not actually show the count here, as it is used in a table.
		this.$('.wordDesc').text(
			locale.sayPlural('Word', 'Words', wordCount)
		);

		// L10n: This does not actually show the count here, as it is used in a
		// table.
		this.$('.passageDesc').text(
			locale.sayPlural('Passage', 'Passages', passageCount)
		);

		// L10n: Links in the sense of hypertext links.
		// This does not actually show the count here, as it is used in a
		// table.
		this.$('.linkDesc').text(
			locale.sayPlural('Link', 'Links', passageCount)
		);

		// L10n: Links in the sense of hypertext links.
		// This does not actually show the count here, as it is used in a
		// table.
		this.$('.brokenLinkDesc').text(
			locale.sayPlural('Broken Link', 'Broken Links', passageCount)
		);

		this.$el.data('modal').trigger('show');
	},

	/**
	 Closes the modal dialog.

	 @method close
	**/

	close() {
		this.$el.data('modal').trigger('hide');
	}
});

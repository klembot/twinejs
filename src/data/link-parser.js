// Parses passage text for links. Optionally, it returns internal links only --
// e.g. those pointing to other passages in a story, not to an external web
// site.

module.exports = (text, internalOnly) => {
	// The top level regular expression to catch links -- i.e. [[link]].

	const matches = text.match(/\[\[.*?\]\]/g);

	if (!matches) {
		return [];
	}

	// Links we've already found, to ensure the array we return contains only
	// unique links.

	const found = {};

	// A helper function for dealing with arrow links, e.g. [[text->passage]].

	const arrowReplacer = (a, b, c, d) => c || d;

	let result = matches.reduce((links, match) => {
		// The link matching regexps ignore setter components, should
		// they exist.

		const link = match

		// Arrow links:
		// [[display text->link]] format
		// [[link<-display text]] format
		//
		// Arrow links, with setter component:
		// [[display text->link][...]] format
		// [[link<-display text][...]] format
		//
		// This regexp will interpret the rightmost '->' and the leftmost
		// '<-' as the divider.

			.replace(/\[\[(?:([^\]]*)\->|([^\]]*?)<\-)([^\]]*)(?:\]\[.*?)?\]\]/g, arrowReplacer)

		// TiddlyWiki links:
		// [[display text|link]] format
		//
		// TiddlyWiki links, with setter component:
		// [[display text|link][...]] format

			.replace(/\[\[([^\|\]]*?)\|([^\|\]]*)?(?:\]\[.*?)?\]\]/g, '$2')

		// [[link]] format, and [[link][...]] format, with setter component

			.replace(/\[\[|(?:\]\[.*?)?\]\]/g,'');

		// Catch empty links and links we've already found.

		if (link !== '' && found[link] === undefined) {
			found[link] = true;
			links.push(link);
		}

		return links;
	}, []);

	if (internalOnly) {
		// Remove any link starting with a protocol, e.g. abcd://.

		result = result.filter(link => !/^\w+:\/\/\/?\w/i.test(link));
	}
	
	return result;
};

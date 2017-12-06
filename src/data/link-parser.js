/*
Parses passage text for links. Optionally, it returns internal links only --
e.g. those pointing to other passages in a story, not to an external web site.
*/

'use strict';

/* The top level regular expression to catch links -- i.e. [[link]]. */
const extractLinkTags = (text) => text.match(/\[\[.*?\]\]/g) || [];

/* Links _not_ starting with a protocol, e.g. abcd://. */
const internalLinks = link => !/^\w+:\/\/\/?\w/i.test(link);

const nonEmptyLinks = link => link !== '';

/* Identifies values that appear only once in the array. */
const uniques = (v, i, a) => a.indexOf(v) === i;

/* Setter is the second [] block if exists. */
const removeSetters = link => {
	const noSetter = getField(link, '][', 0);

	return typeof (noSetter) !== 'undefined' ? noSetter : link;
};

const removeEnclosingBrackets = link => link.substr(2, link.length - 4);

/*
Split the link by the separator and return the field in the
given index. Negative indices start from the end of the array.
*/
const getField = (link, separator, index) => {
	const fields = link.split(separator);

	if (fields.length === 1) {
		/* Separator not present. */
		return undefined;
	}

	return (index < 0) ? fields[fields.length + index] : fields[index];
};

const extractLink = (tagContent) => {
	/*
	Arrow links:
	[[display text->link]] format
	[[link<-display text]] format
	
	Interpret the rightmost '->' and the leftmost '<-' as the divider.
	*/

	return getField(tagContent, '->', -1) ||
		   getField(tagContent, '<-', 0) ||

		   /*
		   TiddlyWiki links:
		   [[display text|link]] format
		   */
		   getField(tagContent, '|', -1) ||
		   
		   /* [[link]] format */
		   tagContent;
};
										   
module.exports = (text, internalOnly) => {
	/*
	Link matching regexps ignore setter components, should they exist.
	*/

	let result = extractLinkTags(text)
		.map(removeEnclosingBrackets)
		.map(removeSetters)
		.map(extractLink)
		.filter(nonEmptyLinks)
		.filter(uniques);

	if (internalOnly) {
		result = result.filter(internalLinks);
	}

	return result;
};
import escapeRegExp from 'lodash/escapeRegExp';
import {StorySearchFlags} from '../store/stories/stories.types';

/**
 * Creates RegExps using UI-visible settings.
 */
export function createRegExp(
	search: string,
	flags: Omit<StorySearchFlags, 'includePassages'>
) {
	return new RegExp(
		flags.useRegexes ? search : escapeRegExp(search),
		flags.matchCase ? 'g' : 'gi'
	);
}

/**
 * Escapes replacement strings if the user didn't intend them to be regexps.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
 */
export function escapeRegExpReplace(source: string) {
	// This implementation is a little tricky in that it needs to escape the $s
	// itself in the replacement.

	return source.replace(/\$/g, '$$$$');
}

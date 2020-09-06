/*
Creates RegExps using UI-visible settings.
*/

import escapeRegexp from 'lodash.escaperegexp';

export function createRegExp(search, {matchCase, useRegexes}) {
	return new RegExp(
		useRegexes ? search : escapeRegexp(search),
		matchCase ? 'g' : 'gi'
	);
}

/*
Escapes replacement strings if the user didn't intend them to be regexps.
This implementation is a little tricky in that it needs to escape the $s itself in the replacement.
See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
*/

export function escapeRegExpReplace(source) {
	return source.replace(/\$/g, '$$$$');
}

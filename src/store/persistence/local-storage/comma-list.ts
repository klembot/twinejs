// Lightweight functions for dealing with comma-delimited strings (e.g. that don't
// deal with all the intracacies of dealing with the actual CSV format, e.g.
// quotation marks).

/**
 * Returns whether a list contains a value.
 */
export function contains(list: string, value: string) {
	return new RegExp('\\b' + value + '\\b').test(list);
}

/**
 * Adds a value to a list if it's not already present.
 */
export function addUnique(list: string, value: string) {
	if (list === '') {
		return value;
	}

	if (contains(list, value)) {
		return list;
	}

	return list + ',' + value;
}

/**
 * Removes a value from a list.
 */
export function remove(list: string, value: string) {
	list = list.replace(new RegExp(',?' + value), '');

	// We end up with a leading comma if we just removed the first value.

	if (list[0] === ',') {
		return list.substring(1);
	}

	return list;
}

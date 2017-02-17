// Lightweight functions for dealing with comma-delimited strings (e.g. that
// don't deal with all the intracacies of dealing with the actual CSV format,
// e.g. quotation marks).

const commaList = module.exports = {
	// Returns whether a list contains a value.

	contains(list, value) {
		return (new RegExp('\\b' + value + '\\b')).test(list);
	},

	// Adds a value to a list if it's not already in there.

	addUnique(list, value) {
		if (list === '') {
			return value;
		}

		if (commaList.contains(list, value)) {
			return list;
		}

		return list + ',' + value;
	},

	// Removes a value from a list.

	remove(list, value) {
		list = list.replace(new RegExp(',?' + value), '');
		
		// We end up with a leading comma if we just removed the first value.

		if (list[0] === ',') {
			return list.substring(1);
		}

		return list;
	}
};

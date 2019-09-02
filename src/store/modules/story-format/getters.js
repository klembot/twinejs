/* Looking up a format by ID. */

export function formatWithId(store, id) {
	const format = store.formats.find(f => f.id === id);

	if (!format) {
		throw new Error(`No story format exists with ID "${id}"`);
	}

	return format;
}

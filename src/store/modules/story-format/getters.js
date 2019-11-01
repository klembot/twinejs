import semverUtils from 'semver-utils';

/* Looking up a format by ID. */

export const formatWithId = state => id => {
	const format = state.formats.find(f => f.id === id);

	if (!format) {
		throw new Error(`No story format exists with ID "${id}"`);
	}

	return format;
};

/*
determine the most recent version of a given story format name and major
version. This essentially implements the ^1.0.0 version selector seen in
package.json etc., but without the caret.
*/

export const latestFormat = state => (name, version) => {
	const majorVersion = semverUtils.parse(version).major;

	/*
	Locate candidate formats, e.g. with the same major version as the one
	requested.
	*/

	const majorFormats = state.formats.filter(
		format =>
			format.name === name &&
			semverUtils.parse(format.version).major === majorVersion
	);

	if (majorFormats.length === 0) {
		return;
	}

	/*
	Pick the format that has the highest minor version, then highest patch
	version.
	*/

	const latestFormat = majorFormats.reduce((latest, current) => {
		const pVer = semverUtils.parse(latest.version);
		const pMinor = parseInt(pVer.minor);
		const pPatch = parseInt(pVer.patch);
		const cVer = semverUtils.parse(current.version);
		const cMinor = parseInt(cVer.minor);
		const cPatch = parseInt(cVer.patch);

		if (cMinor <= pMinor && cPatch <= pPatch) {
			return latest;
		}

		return current;
	});

	return latestFormat;
};

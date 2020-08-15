import semverUtils from 'semver-utils';

/* Looking up a format by ID. */

export const formatWithId = state => id => {
	return state.formats.find(f => f.id === id);
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
		const latestVersion = semverUtils.parse(latest.version);
		const latestMinor = parseInt(latestVersion.minor);
		const latestPatch = parseInt(latestVersion.patch);
		const currentVersion = semverUtils.parse(current.version);
		const currentMinor = parseInt(currentVersion.minor);
		const currentPatch = parseInt(currentVersion.patch);

		if (
			currentMinor > latestMinor ||
			(currentMinor === latestMinor && currentPatch > latestPatch)
		) {
			return current;
		}

		return latest;
	});

	return latestFormat;
};

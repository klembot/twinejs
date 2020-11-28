import semverUtils from 'semver-utils';
import sortFormats from '@/util/sort-formats';

export const allFormats = state => state.formats.sort(sortFormats);

/*
These require loading the formats first, because proofing is not stored as a
top-level property.
*/

export const allProofingFormats = state =>
	state.formats
		.filter(f => f.properties && f.properties.proofing)
		.sort(sortFormats);

export const allStoryFormats = state =>
	state.formats
		.filter(f => f.properties && !f.properties.proofing)
		.sort(sortFormats);

/*
What percentage of formats are loaded? Used for progress meters and similar.
*/

export const formatLoadPercent = state =>
	state.formats.reduce(
		(result, current) =>
			current.properties || current.loadError ? result + 1 : result,
		0
	) / state.formats.length;

/*
What format, if any, is loading? Only one can load at a time.
*/

export const formatLoading = state => state.formats.find(f => f.loading);

/* Looking up a format by ID. */

export const formatWithId = state => id => {
	return state.formats.find(f => f.id === id);
};

/*
Determine the most recent version of a given story format name and major
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

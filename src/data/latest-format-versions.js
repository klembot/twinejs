/*
Returns the latest story format version available, indexed by format name and
major version (as a string, not a number).
*/

const semverUtils = require('semver-utils');

module.exports = store => {
	const latestVersions = {};

	store.state.storyFormat.formats.forEach(format => {
		if (!format.version) {
			return;
		}

		const v = semverUtils.parse(format.version);

		if (latestVersions[format.name]) {
			const existing = latestVersions[format.name][v.major];

			if (!existing ||
				v.minor > existing.minor ||
				v.minor === existing.minor && v.patch > existing.patch) {
				latestVersions[format.name][v.major] = v;
			}
		}
		else {
			latestVersions[format.name] = {};
			latestVersions[format.name][v.major] = v;
		}
	});

	return latestVersions;
};
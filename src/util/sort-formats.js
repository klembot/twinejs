import {parse} from 'semver-utils';

export default function formatSorter(a, b) {
	if (!a.name || !b.name) {
		throw new Error('Format has no name property');
	}

	if (!a.version || !b.version) {
		throw new Error('Format has no version property');
	}

	/* Names are sorted in descending alphabetical order. */

	if (a.name < b.name) {
		return -1;
	}

	if (b.name < a.name) {
		return 1;
	}

	/* Compare versions. We sort these in descending order. */

	const aVersion = parse(a.version);
	const bVersion = parse(b.version);

	let result = 0;

	['major', 'minor', 'patch'].some(field => {
		const aField = parseInt(aVersion[field]);
		const bField = parseInt(bVersion[field]);

		if (aField < bField) {
			result = 1;
			return true;
		}

		if (bField < aField) {
			result = -1;
			return true;
		}
	});

	return result;
}

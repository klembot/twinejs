/*
This exports a value, not a function, so that it stays consistent across an
entire build process.
*/

const fs = require('fs');
const path = require('path');
const twine = require('../package.json');

function pad(value) {
	const valueString = value.toString();

	return valueString.length === 1 ? '0' + valueString : valueString;
}

const now = new Date();

const buildNumber = {
	number:
		now.getFullYear().toString() +
		pad(now.getMonth() + 1) +
		pad(now.getDate()) +
		pad(now.getHours()) +
		pad(now.getMinutes()),
	writeToFile() {
		fs.writeFile(
			path.resolve(__dirname, '../dist/2.json'),
			JSON.stringify({
				number: buildNumber.number,
				version: twine.version,
				url: 'https://twinery.org'
			}),
			{encoding: 'utf8'},
			() => console.log('Wrote dist/2.json.')
		);
	}
};

module.exports = buildNumber;

/* https://stackoverflow.com/a/6398335 */

if (require.main === module) {
	buildNumber.writeToFile();
}

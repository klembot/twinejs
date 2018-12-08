/*
This exports a value, not a function, so that it stays consistent across an
entire build process.
*/

const fs = require('fs');
const moment = require('moment');
const path = require('path');
const twine = require('../package.json');

const BuildNumber = (module.exports = {
	number: moment().format('YYYYMMDDHHmm'),
	writeToFile() {
		fs.writeFile(
			path.resolve(__dirname, '../dist/2.json'),
			JSON.stringify({
				number: BuildNumber.number,
				version: twine.version,
				url: 'https://twinery.org'
			}),
			{encoding: 'utf8'},
			() => console.log('Wrote dist/2.json.')
		);
	}
});

/* https://stackoverflow.com/a/6398335 */

if (require.main === module) {
	BuildNumber.writeToFile();
}

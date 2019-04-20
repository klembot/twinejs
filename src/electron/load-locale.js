/*
Loads the user's locale. This is needed during startup to set the user's story
directory correctly. Locale data is also loaded by the browser process during
startup; see `../index.js`.
*/

const fs = require('fs-extra');
const path = require('path');
const {loadJson, loadDefault} = require('../locale');

module.exports = function(prefs) {
	return new Promise(resolve => {
		if (prefs.locale) {
			const localeName = prefs.locale.toLowerCase();

			if (localeName === 'en' || localeName === 'en-us') {
				loadDefault();
				resolve();
				return;
			}

			const localePath = path.resolve(
				__dirname,
				`../../dist/web-electron/locale/${localeName}.js`
			);

			fs.readFile(localePath, {encoding: 'utf8'})
				.then(data => {
					/* Strip the JSONP wrapper. */

					data = data.replace(/^window.locale\(/, '');
					data = data.replace(/\);$/, '');

					loadJson(localeName, JSON.parse(data));
					resolve();
				})
				.catch(e => {
					console.warn(
						`Could not load locale data at ${localePath} (${
							e.message
						}), using default locale`
					);
					loadDefault();
					resolve();
				});
		} else {
			console.warn(`No locale preference found, using default`);
			loadDefault();
			resolve();
		}
	});
};

// A function that checks for an update to Twine, and displays a confirm dialog
// asking the user to download it.

const AppPref = require('../../data/models/app-pref');
const checkForUpdate = require('../../common/app/update-check');
const locale = require('../../locale');
const { confirm } = require('../confirm');

// How often we check for a new version of Twine, in milliseconds. This is
// currently one day.

const CHECK_DELAY = 1000 * 60 * 60 * 24;

module.exports = {
	check() {
		// Find the last update we've seen.

		const lastUpdateSeenPref = AppPref.withName(
			'lastUpdateSeen',
			window.app.buildNumber
		);

		// Force the last update to be at least the current app version.

		if (lastUpdateSeenPref.get('value') < window.app.buildNumber) {
			lastUpdateSeenPref.save({ value: window.app.buildNumber });
		}

		const lastUpdateCheckPref = AppPref.withName(
			'lastUpdateCheckTime',
			new Date().getTime()
		);

		// Is there a new update since we last checked?

		if (new Date().getTime() > lastUpdateCheckPref.get('value') + CHECK_DELAY) {
			checkForUpdate(
				lastUpdateSeenPref.get('value'),
				({buildNumber, version, url}) => {
					lastUpdateSeenPref.save({ value: buildNumber });

					confirm({
						message:
							// L10n: The <span> will have a version number, i.e.
							// 2.0.6, interpolated into it.
							locale.say(
								'A new version of Twine, <span class="version">' +
								'</span>, has been released.'
							).replace('><', '>' + version + '<'),

						buttonLabel:
							'<i class="fa fa-download"></i>' +
							locale.say('Download'),

						cancelLabel:
							// L10n: A polite rejection of a request, in the sense that the answer
							// may change in the future.
							locale.say('Not Right Now'),

						buttonClass:
							'download',

						modalClass:
							'info',
					})
					.then(() => { window.open(url); });
				}
			);
		}
	}
};

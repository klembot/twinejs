/*
A function that checks for an update to Twine, and displays a confirm dialog
asking the user to download it.
*/

const checkForUpdate = require('../../common/app/update-check');
const { confirm } = require('../confirm');
const locale = require('../../locale');
const { setPref } = require('../../data/actions/pref');

/*
How often we check for a new version of Twine, in milliseconds. This is
currently one day.
*/

const CHECK_DELAY = 1000 * 60 * 60 * 24;

module.exports = {
	check(store) {
		/*
		Force the last update we've seen to be at least the current app
		version.
		*/

		if (!store.state.pref.lastUpdateSeen ||
			store.state.pref.lastUpdateSeen < store.state.appInfo.buildNumber) {
			setPref(store, 'lastUpdateSeen', store.state.appInfo.buildNumber);
		}

		/* Is there a new update since we last checked? */

		const checkTime = store.state.pref.lastUpdateCheckTime + CHECK_DELAY;

		if (new Date().getTime() > checkTime) {
			checkForUpdate(
				store.state.pref.lastUpdateSeen,
				({ buildNumber, version, url }) => {
					setPref(store, 'lastUpdateSeen', buildNumber);

					confirm({
						message:
							/*
							L10n: The <span> will have a version number, i.e.
							2.0.6, interpolated into it.
							*/
							locale.say('A new version of Twine, <span class="version"></span>, has been released.').replace('><', '>' + version + '<'),

						buttonLabel:
							'<i class="fa fa-download"></i>' +
							locale.say('Download'),

						cancelLabel:
							/*
							L10n: A polite rejection of a request, in the sense
							that the answer may change in the future.
							*/
							locale.say('Not Right Now'),

						buttonClass:
							'download primary',

						modalClass:
							'info',
					})
					.then(() => { window.open(url); });
				}
			);
		}
	}
};

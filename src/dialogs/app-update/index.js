/*
A function that checks for an update to Twine, and displays a confirm dialog
asking the user to download it.
*/

import checkForUpdate from '../../common/app/update-check';
import eventHub from '../../common/eventHub';
import {say} from '../../locale';
import {setPref} from '../../data/actions/pref';

/*
How often we check for a new version of Twine, in milliseconds. This is
currently one day.
*/

const CHECK_DELAY = 1000 * 60 * 60 * 24;

export default function check(store) {
	/*
	Force the last update we've seen to be at least the current app
	version.
	*/

	if (
		!store.state.pref.lastUpdateSeen ||
		store.state.pref.lastUpdateSeen < store.state.appInfo.buildNumber
	) {
		setPref(store, 'lastUpdateSeen', store.state.appInfo.buildNumber);
	}

	/* Is there a new update since we last checked? */

	const checkTime = store.state.pref.lastUpdateCheckTime + CHECK_DELAY;

	if (new Date().getTime() > checkTime) {
		checkForUpdate(
			store.state.pref.lastUpdateSeen,
			({buildNumber, version, url}) => {
				setPref(store, 'lastUpdateSeen', buildNumber);

				eventHub.$once('close', confirmed => {
					if (confirmed) {
						window.open(url);
					}
				});
				const confirmArgs = {
					buttonlabel:
						'<i class="fa fa-download"></i>' + say('Download'),
					buttonClass: 'download primary',
					modalClass: 'info',
					cancelLabel: say('Not Right Now'),
					message: locale
						.say(
							'A new version of Twine, <span class="version"></span>, has been released.'
						)
						.replace('><', '>' + version + '<')
				};

				eventHub.$emit('modalConfirm', confirmArgs);
			}
		);
	}
}

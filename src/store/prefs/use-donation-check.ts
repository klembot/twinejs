import * as React from 'react';
import {usePrefsContext} from '.';

/**
 * How long since the user began using Twine to show a donation prompt. It's set
 * to 14 days.
 */
export const donationDelay = 1000 * 60 * 60 * 24 * 14;

export function useDonationCheck() {
	const {prefs} = usePrefsContext();

	const shouldShowDonationPrompt = React.useCallback(() => {
		if (prefs.donateShown) {
			return false;
		}

		return Date.now() > prefs.firstRunTime + donationDelay;
	}, [prefs.donateShown, prefs.firstRunTime]);

	return {shouldShowDonationPrompt};
}

// Listens to changes in the locale preference and changes i18n's language
// accordingly.

import * as React from 'react';
import {usePrefsContext} from './prefs';
import {i18n} from '../util/i18n';

export const LocaleSwitcher: React.FC = () => {
	const {prefs} = usePrefsContext();

	React.useEffect(() => {
		i18n.changeLanguage(prefs.locale);
	}, [prefs.locale]);

	return null;
};

import * as React from 'react';
import {useComputedTheme} from './prefs/use-computed-theme';

export function ThemeSetter() {
	const computedTheme = useComputedTheme();

	React.useEffect(() => {
		document.body.dataset.appTheme = computedTheme;
		if (computedTheme === "dark") {
			document.documentElement.style.setProperty('color-scheme', 'dark');
		} else {
			document.documentElement.style.setProperty('color-scheme', 'light');
		}
	}, [computedTheme]);

	return null;
}

import * as React from 'react';
import {useComputedTheme} from './prefs/use-computed-theme';

export function ThemeSetter() {
	const computedTheme = useComputedTheme();

	React.useEffect(() => {
		document.body.dataset.appTheme = computedTheme;
	}, [computedTheme]);

	return null;
}

import * as React from 'react';
import {usePrefsContext} from './prefs';

export function ThemeSetter() {
	// See https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia

	const {prefs} = usePrefsContext();
	const [mediaQuery] = React.useState(
		window.matchMedia('(prefers-color-scheme: dark)')
	);
	const [systemTheme, setSystemTheme] = React.useState<'dark' | 'light'>(
		mediaQuery.matches ? 'dark' : 'light'
	);

	React.useEffect(() => {
		const listener = (event: MediaQueryListEvent) =>
			setSystemTheme(event.matches ? 'dark' : 'light');

		mediaQuery.addEventListener('change', listener);
		return () => mediaQuery.removeEventListener('change', listener);
	}, [mediaQuery]);

	React.useEffect(() => {
		document.body.dataset.appTheme =
			prefs.appTheme === 'system' ? systemTheme : prefs.appTheme;
	}, [prefs.appTheme, systemTheme]);

	return null;
}

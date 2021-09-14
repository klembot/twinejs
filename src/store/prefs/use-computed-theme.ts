import * as React from 'react';
import {usePrefsContext} from '.';

export function useComputedTheme() {
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

	return prefs.appTheme === 'system' ? systemTheme : prefs.appTheme;
}

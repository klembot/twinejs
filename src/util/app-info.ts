export interface AppInfo {
	buildNumber: string;
	name: string;
	version: string;
}

/**
 * Retrieves information about the Twine app itself based on buildtime
 * rendering.
 */
export function getAppInfo(): AppInfo {
	const htmlEl = document.querySelector('html');

	if (!htmlEl) {
		throw new Error('Could not find <html> element');
	}

	// TODO: write these into HTML during build

	return {
		name: htmlEl.getAttribute('data-app-name') ?? '',
		version: htmlEl.getAttribute('data-version') ?? '',
		buildNumber: htmlEl.getAttribute('data-build-number') ?? '',
	};
}

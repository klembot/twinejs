export interface AppInfo {
	name: string;
	version: string;
}

/**
 * Retrieves information about the Twine app itself based on buildtime
 * environment
 */
export function getAppInfo(): AppInfo {
	return {
		name: process.env.VITE_APP_NAME as string,
		version: process.env.VITE_APP_VERSION as string
	};
}

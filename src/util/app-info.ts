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
		name: process.env.REACT_APP_NAME as string,
		version: process.env.REACT_APP_VERSION as string
	};
}

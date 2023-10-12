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
		name: import.meta.env.APP_NAME as string,
		version: import.meta.env.APP_VERSION as string
	};
}

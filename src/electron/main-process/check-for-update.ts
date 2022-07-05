import {dialog, shell} from 'electron';
import {version as twineVersion} from '../../../package.json';
import {gt} from 'semver';
import fetch from 'node-fetch';
import {i18n} from './locales';

const checkUrl = 'https://twinery.org/latestversion/2.json';

interface VersionResponse {
	/**
	 * Build number, format yyyymmdd. Not used since 2.4.
	 */
	buildNumber: string;
	/**
	 * URL to send users to do for the update.
	 */
	url: string;
	/**
	 * Latest version number, eg. '2.4.3'.
	 */
	version: string;
}

export async function checkForUpdate() {
	console.log(`Checking for application update at ${checkUrl}`);

	try {
		const {url, version} = (await (
			await fetch(checkUrl)
		).json()) as unknown as VersionResponse;

		console.log(`Received version ${version}, url ${url}`);

		if (gt(version, twineVersion)) {
			const {response} = await dialog.showMessageBox({
				buttons: [
					i18n.t('electron.updateCheck.download'),
					i18n.t('common.cancel')
				],
				defaultId: 0,
				icon: 'info',
				message: i18n.t('electron.updateCheck.updateAvailable')
			});

			if (response === 0) {
				shell.openExternal(url);
			}
		} else {
			dialog.showMessageBox({
				message: i18n.t('electron.updateCheck.upToDate'),
				type: 'info'
			});
		}
	} catch (error) {
		dialog.showErrorBox(
			i18n.t('electron.updateCheck.error'),
			(error as Error).message
		);
	}
}

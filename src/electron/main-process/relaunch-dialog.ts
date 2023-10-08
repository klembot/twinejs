import {app, dialog} from 'electron';
import {i18n} from './locales';

export async function showRelaunchDialog(message?: string) {
	const {response} = await dialog.showMessageBox({
		message: message ?? i18n.t('electron.relaunchDialog.defaultPrompt'),
		type: 'info',
		buttons: [
			i18n.t('common.ok'),
			i18n.t('electron.relaunchDialog.relaunchNow')
		],
		defaultId: 0
	});

	if (response === 1) {
		app.relaunch();
		app.quit();
	}
}

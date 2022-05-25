import {
	app,
	BrowserWindow,
	Menu,
	shell,
	MenuItemConstructorOptions
} from 'electron';
import {revealStoryDirectory} from './story-directory';
import {i18n} from './locales';
import {checkForUpdate} from './check-for-update';

export function initMenuBar() {
	const template: MenuItemConstructorOptions[] = [
		{
			label: app.getName(),
			submenu: [
				{role: 'about'},
				{
					label: i18n.t('electron.menuBar.checkForUpdates'),
					click: checkForUpdate
				},
				{type: 'separator'},
				{role: 'quit'}
			]
		},
		{
			label: i18n.t('electron.menuBar.edit'),
			submenu: [
				{role: 'undo'},
				{role: 'redo'},
				{type: 'separator'},
				{role: 'cut'},
				{role: 'copy'},
				{role: 'paste'},
				{role: 'delete'},
				{role: 'selectAll'}
			]
		},
		{
			label: i18n.t('electron.menuBar.view'),
			submenu: [
				{
					label: i18n.t('electron.menuBar.showStoryLibrary'),
					click: revealStoryDirectory
				},
				{type: 'separator'},
				{role: 'resetZoom'},
				{role: 'zoomIn'},
				{role: 'zoomOut'},
				{role: 'togglefullscreen'}
			]
		},
		{
			role: 'window',
			submenu: [{role: 'minimize'}, {role: 'close'}]
		},
		{
			role: 'help',
			submenu: [
				{
					label: i18n.t('electron.menuBar.twineHelp'),
					click: () => shell.openExternal('https://twinery.org/2guide')
				},
				{type: 'separator'},
				{
					label: i18n.t('electron.menuBar.troubleshooting'),
					submenu: [
						{
							label: i18n.t('electron.menuBar.showDevTools'),
							click: () =>
								BrowserWindow.getFocusedWindow()?.webContents.openDevTools()
						}
					]
				}
			]
		}
	];

	if (process.platform === 'darwin') {
		template[0].submenu = [
			{role: 'about'},
			{
				label: i18n.t('electron.menuBar.checkForUpdates'),
				click: checkForUpdate
			},
			{type: 'separator'},
			{role: 'services', submenu: []},
			{type: 'separator'},
			{role: 'hide'},
			{role: 'hideOthers'},
			{role: 'unhide'},
			{type: 'separator'},
			{role: 'quit'}
		];

		(template[2].submenu as MenuItemConstructorOptions[]).push(
			{type: 'separator'},
			{
				label: i18n.t('electron.menuBar.speech'),
				submenu: [{role: 'startSpeaking'}, {role: 'stopSpeaking'}]
			}
		);

		template[3].submenu = [
			{role: 'close'},
			{role: 'minimize'},
			{role: 'zoom'},
			{type: 'separator'},
			{role: 'front'}
		];
	}

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

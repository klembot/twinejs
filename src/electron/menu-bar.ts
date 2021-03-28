import {app, Menu, shell, MenuItemConstructorOptions} from 'electron';
import {revealStoryDirectory} from './story-directory';

export function initMenuBar() {
	const template: MenuItemConstructorOptions[] = [
		{
			label: 'Edit',
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
			label: 'View',
			submenu: [
				{label: 'Show Story Library', click: revealStoryDirectory},
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
					label: 'Twine Guide',
					click: () =>
						shell.openExternal('https://twinery.org/2guide')
				}
			]
		}
	];

	if (process.platform === 'darwin') {
		template.unshift({
			label: app.getName(),
			submenu: [
				{role: 'about'},
				{type: 'separator'},
				{role: 'services', submenu: []},
				{type: 'separator'},
				{role: 'hide'},
				{role: 'hideOthers'},
				{role: 'unhide'},
				{type: 'separator'},
				{role: 'quit'}
			]
		});

		(template[2].submenu as MenuItemConstructorOptions[]).push(
			{type: 'separator'},
			{
				label: 'Speech',
				submenu: [{role: 'startSpeaking'}, {role: 'stopSpeaking'}]
			}
		);

		template[4].submenu = [
			{role: 'close'},
			{role: 'minimize'},
			{role: 'zoom'},
			{type: 'separator'},
			{role: 'front'}
		];
	}

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

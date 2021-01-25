const {app, Menu} = require('electron');
const {openHelp} = require('./help');
const {reveal: revealStoryDirectory} = require('./story-directory');

module.exports = () => {
	const template = [
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
				{role: 'selectall'}
			]
		},
		{
			label: 'View',
			submenu: [
				{label: 'Show Story Library', click: revealStoryDirectory},
				{type: 'separator'},
				{role: 'resetzoom'},
				{role: 'zoomin'},
				{role: 'zoomout'},
				{type: 'separator'},
				{role: 'togglefullscreen'},
				{type: 'separator'},
				{role: 'toggledevtools'}
			]
		},
		{
			role: 'window',
			submenu: [{role: 'minimize'}, {role: 'close'}]
		},
		{
			role: 'help',
			submenu: [{label: 'Twine Guide', click: openHelp}]
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
				{role: 'hideothers'},
				{role: 'unhide'},
				{type: 'separator'},
				{role: 'quit'}
			]
		});

		template[2].submenu.push(
			{type: 'separator'},
			{
				label: 'Speech',
				submenu: [{role: 'startspeaking'}, {role: 'stopspeaking'}]
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
};


'use strict';

var nwui =
{
	active: 
	(typeof process !== "undefined" &&
	 typeof require !== "undefined" &&
	 typeof require('nw.gui') !== 'undefined'),

	init: function()
	{
		nwui.gui = require('nw.gui');

		var win = nwui.gui.Window.get();
		var nativeMenuBar = new nwui.gui.Menu({ type: 'menubar' });
		var mainMenu;

		if (process.platform == 'darwin')
		{
			// create Mac menus

			nativeMenuBar.createMacBuiltin(window.app.name);
			mainMenu = _.findWhere(nativeMenuBar.items, { label: '' });
		}
		else
		{
			// create a basic menu on other platforms

			mainMenu = new nwui.gui.MenuItem({
				label: window.app.name,
				submenu: new nwui.gui.Menu()
			});

			mainMenu.submenu.append(new nwui.gui.MenuItem({
				label: 'Quit',
				key: 'q',
				modifiers: 'ctrl',
				click: function()
				{
					nwui.gui.App.quit();
				}
			}));

			mainMenu.submenu.insert(new nwui.gui.MenuItem({ type: 'separator' }), 0);
			nativeMenuBar.append(mainMenu);

			// and a stand-in Edit menu

			var editMenu = new nwui.gui.MenuItem({
				label: 'Edit',
				submenu: new nwui.gui.Menu()
			});

			editMenu.submenu.append(new nwui.gui.MenuItem({
				label: 'Undo',
				key: 'z',
				modifiers: 'ctrl',
				click: function()
				{
				}
			}));

			editMenu.submenu.append(new nwui.gui.MenuItem({ type: 'separator' }));

			editMenu.submenu.append(new nwui.gui.MenuItem({
				label: 'Cut',
				key: 'x',
				modifiers: 'ctrl',
				click: function()
				{
					document.execCommand('cut');
				}
			}));

			editMenu.submenu.append(new nwui.gui.MenuItem({
				label: 'Copy',
				key: 'c',
				modifiers: 'ctrl',
				click: function()
				{
					document.execCommand('copy');
				}
			}));

			editMenu.submenu.append(new nwui.gui.MenuItem({
				label: 'Paste',
				key: 'v',
				modifiers: 'ctrl',
				click: function()
				{
					document.execCommand('paste');
				}
			}));

			editMenu.submenu.append(new nwui.gui.MenuItem({
				label: 'Delete',
				click: function()
				{
					document.execCommand('delete');
				}
			}));

			nativeMenuBar.append(editMenu);
		};

		// add fullscreen item

		mainMenu.submenu.insert(new nwui.gui.MenuItem({
			label: 'Toggle Fullscreen',
			key: 'f',
			modifiers: (process.platform == 'darwin') ? 'cmd-shift' : 'ctrl-shift',
			click: function()
			{
				nwui.gui.Window.get().toggleFullscreen();
			}
		}), 0);

		win.menu = nativeMenuBar;

		// open external links outside the app

		$('body').on('click', 'a', function (e)
		{
			var url = $(this).attr('href');

			if (url.match(/^https?:/))
			{
				nwui.gui.Shell.openExternal(url);
				e.preventDefault();
			};
		});
	}
};

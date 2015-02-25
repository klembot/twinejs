
'use strict';

var nwui =
{
	active: 
	(typeof process !== "undefined" &&
	 typeof require !== "undefined" &&
	 typeof require('nw.gui') !== 'undefined'),

	syncFiles: true,

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

		// create ~/Documents/Twine if it doesn't exist

		var expandHomeDir = require('expand-home-dir');
		nwui.fs = require('fs');

		nwui.filePath = expandHomeDir('~/Documents/Twine/');

		if (! nwui.fs.existsSync(nwui.filePath))
		{
			var docPath = expandHomeDir('~/Documents');

			if (! nwui.fs.existsSync(docPath))
				nwui.fs.mkdirSync(docPath);

			nwui.fs.mkdirSync(nwui.filePath);
		};

		// monkey patch Story to save to a file
		// under ~/Documents/Twine whenever the model changes

		var oldStoryInit = Story.prototype.initialize;

		Story.prototype.initialize = function()
		{
			oldStoryInit.call(this);

			this.on('change', _.debounce(function()
			{
				if (! nwui.syncFiles || this.fetchPassages().length == 0)
					return;

				// this must be deferred in order for this to 'see' a passage change

				_.defer(_.bind(function()
				{
					try
					{
						var fd = nwui.fs.openSync(nwui.filePath + this.get('name') + '.html', 'w');
						nwui.fs.writeSync(fd, this.publish());
						nwui.fs.closeSync(fd);
					}
					catch (e)
					{
						ui.notify('An error occurred while saving your story (' + e.message + ').', 'danger');
					};
				}, this));
			}, 100), this);
		};

		// monkey patch TwineRouter to sync the story list
		// with files saved to disk

		var oldListStories = TwineRouter.prototype.listStories;

		TwineRouter.prototype.listStories = function()
		{
			nwui.syncFiles = false;
			var localStories = StoryCollection.all();
			var fileStories = nwui.fs.readdirSync(nwui.filePath);

			// eliminate duplicates from both lists

			for (var i = 0; i < localStories.length; i++)
			{
				var fileInd = fileStories.indexOf(localStories.at(i).get('name') + '.html');

				if (fileInd != -1)
				{
					fileStories.splice(fileInd, 1);
					localStories.remove(localStories.at(i));
					i--;
				};
			};

			// localStories contains stories that no longer have a backing file

			localStories.invoke('destroy');

			// fileStories contains stories that need to have a local version created

			_.each(fileStories, function (filename)
			{
				if (filename.match(/\.html$/))
					window.app.importFile(nwui.fs.readFileSync(nwui.filePath + filename, { encoding: 'utf-8' }));
			});

			nwui.syncFiles = true;
			oldListStories.call(this);
		};

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

/**
 A singleton that adapts the Twine interface for NW.js,
 adding menus and syncing changes to the filesystem.
 This takes the approach of patching existing classes
 instead of creating a separate set of classes just for
 NW.js, to try to keep things as similar as possible.

 @class nwui
**/

'use strict';

var nwui =
{
	/**
	 Whether Twine is running in a NW.js environment.
	 @property active
	 @static
	 @const
	**/

	active: 
	(typeof process !== "undefined" &&
	 typeof require !== "undefined" &&
	 typeof require('nw.gui') !== 'undefined'),

	/**
	 Whether changes to a story should be saved to the filesystem.
	 This is mainly so that internal nwui methods can do their work
	 without tripping over each other.
	 @property syncFs
	 @static
	 @const
	**/

	syncFs: true,

	/**
	 Performs one-time initialization, e.g. setting up menus.

	 @method init
	**/

	init: function()
	{
		/**
		 An instance of the nw.gui module, for manipulating the native UI.
		 @property gui
		**/

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

		// add item to show story library

		mainMenu.submenu.insert(new nwui.gui.MenuItem({
			label: 'Show Story Library',
			click: function()
			{
				nwui.gui.Shell.openItem(nwui.filePath);
			}
		}), 0);

		win.menu = nativeMenuBar;

		// create ~/Documents/Twine if it doesn't exist

		var expandHomeDir = require('expand-home-dir');

		/**
		 An instance of the fs modules, for working with the native filesystem.
		 @property fs
		**/

		nwui.fs = require('fs');

		/**
		 The path that stories will be saved to in the filesystem.
		 @property filePath
		**/

		nwui.filePath = expandHomeDir('~/Documents/Twine/Stories/');

		if (! nwui.fs.existsSync(nwui.filePath))
		{
			var docPath = expandHomeDir('~/Documents/');

			if (! nwui.fs.existsSync(docPath))
				nwui.fs.mkdirSync(docPath);

			var twinePath = expandHomeDir('~/Documents/Twine/');

			if (! nwui.fs.existsSync(docPath))
				nwui.fs.mkdirSync(twinePath);

			nwui.fs.mkdirSync(nwui.filePath);
		};

		// monkey patch Story to save to a file
		// under ~/Documents/Twine whenever the model changes,
		// or delete it when it is destroyed

		var oldStoryInit = Story.prototype.initialize;

		Story.prototype.initialize = function()
		{
			oldStoryInit.call(this);

			this.on('change', _.debounce(function()
			{
				// if the only thing that is changing is last modified date,
				// then skip it

				if (! _.some(_.keys(this.changedAttributes), function (key)
				{
					return (key != 'lastUpdated');
				}))
					return;

				// if we aren't syncing changes or the story has no passages,
				// give up early

				if (! nwui.syncFs || this.fetchPassages().length == 0)
					return;

				nwui.saveStoryFile(this);
			}, 100), this);

			this.on('destroy', function()
			{
				if (! nwui.syncFs)
					return;

				try
				{
					nwui.fs.unlinkSync(nwui.filePath + this.get('name') + '.html');
				}
				catch (e)
				{
					ui.notify('An error occurred while deleting your story (' + e.message + ').', 'danger');
				};
			}, this);
		};

		// monkey patch Passage to save its parent story whenever
		// it is changed or destroyed

		var oldPassageInit = Passage.prototype.initialize;

		Passage.prototype.initialize = function()
		{
			oldPassageInit.call(this);

			this.on('change destroy', _.debounce(function()
			{
				if (! nwui.syncFs)
					return;

				// if we have no parent, skip it
				// (this happens during an import, for example)

				var parent = this.fetchStory();

				if (parent)
					nwui.saveStoryFile(parent);
			}, 100), this);
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

		// do a file sync

		nwui.syncStoryFiles();
	},

	/**
	 Saves a story model to the file system. If a problem occurs,
	 then a notification is shown to the user.

	 @method saveStoryToFile
	 @param {Story} story Story model to save
	**/

	saveStoryFile: function (story)
	{
		try
		{
			var fd = nwui.fs.openSync(nwui.filePath + story.get('name') + '.html', 'w');
			nwui.fs.writeSync(fd, story.publish());
			nwui.fs.closeSync(fd);
		}
		catch (e)
		{
			ui.notify('An error occurred while saving your story (' + e.message + ').', 'danger');
			throw e;
		};
	},

	/**
	 Syncs local storage with the file system, obliterating
	 any stories that happen to be saved to local storage only.

	 @method syncStoryFiles
	**/

	syncStoryFiles: function()
	{
		nwui.syncFs = false;

		// clear all existing stories and passages

		StoryCollection.all().invoke('destroy', { wait: true });

		// read from files

		var fileStories = nwui.fs.readdirSync(nwui.filePath);

		_.each(fileStories, function (filename)
		{
			if (filename.match(/\.html$/))
				window.app.importFile(nwui.fs.readFileSync(nwui.filePath + filename, { encoding: 'utf-8' }));
		});

		nwui.syncFs = true;
	}
};

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
	**/

	syncFs: true,

	/**
	 While the app is open, we lock story files in the filesystem so
	 that the user can't make changes outside of Twine. This indexes
	 the locks we maintain on these files so we can lift one when
	 deleting a file.
	**/

	fileLocks: {},

	/**
	 Performs one-time initialization, e.g. setting up menus.
	 This should be called as early in the app initialization process
	 as possible.

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

			// add fullscreen item
			// only on OS X for now -- hard to reverse on other platforms
			// if you don't remember the keyboard shortcut

			mainMenu.submenu.insert(new nwui.gui.MenuItem({
				label: 'Toggle Fullscreen',
				key: 'f',
				modifiers: 'cmd-shift',
				click: function()
				{
					nwui.gui.Window.get().toggleFullscreen();
				}
			}), 0);
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
					nwui.gui.App.closeAllWindows();
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
					document.execCommand('undo');
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

		// add item to show story library

		/**
		 An instance of the node path module.
		 @property path
		**/

		nwui.path = require('path');

		mainMenu.submenu.insert(new nwui.gui.MenuItem({
			label: 'Show Library',
			click: function()
			{
				nwui.gui.Shell.openItem(nwui.path.resolve(nwui.filePath.replace(/\//g, nwui.path.sep)));
			}
		}), 0);

		win.menu = nativeMenuBar;

		// create ~/Documents/Twine if it doesn't exist

		/**
		 An instance of the fs modules, for working with the native filesystem.
		 @property fs
		**/

		nwui.fs = require('fs');

		/**
		 The path that stories will be saved to in the filesystem.
		 @property filePath
		**/

		var homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

		// if the user doesn't have a Documents folder,
		// check for "My Documents" instead (thanks Windows)

		var docPath = homePath + '/Documents';

		if (! nwui.fs.existsSync(docPath))
		{
			if (nwui.fs.existsSync(homePath + '/My\\ Documents'))
				docPath = homePath + '/My\\ Documents';
			else
				nwui.fs.mkdirSync(docPath);
		};

		nwui.filePath = docPath + '/Twine/Stories/';

		if (! nwui.fs.existsSync(nwui.filePath))
		{
			var twinePath = docPath + '/Twine';

			if (! nwui.fs.existsSync(twinePath))
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

					nwui.deleteStoryFile(this);
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

		// monkey patch StorageQuota to hide itself, since we
		// don't have to sweat quota ourselves

		StoryListView.StorageQuota.prototype.render = function()
		{
			this.$el.css('display', 'none');
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
	
		// when quitting, unlock the story directory

		process.on('exit', function()
		{
			nwui.unlockStoryDirectory();
		});

		// do a file sync if we're just starting up
		// we have to stuff this in the global scope;
		// otherwise, each new window will think it's starting afresh
		// and screw up our model IDs

		if (! global.nwuiFirstRun)
		{
			nwui.syncStoryFiles();
			nwui.lockStoryDirectory();
			global.nwuiFirstRun = true;
		};
	},

	/**
	 Saves a story model to the file system. If a problem occurs,
	 then a notification is shown to the user.

	 @method saveStoryFile
	 @param {Story} story Story model to save
	**/

	saveStoryFile: function (story)
	{
		try
		{
			nwui.unlockStoryDirectory();
			var fd = nwui.fs.openSync(nwui.filePath + story.get('name') + '.html', 'w');
			nwui.fs.writeSync(fd, story.publish());
			nwui.fs.closeSync(fd);
		}
		catch (e)
		{
			ui.notify('An error occurred while saving your story (' + e.message + ').', 'danger');
			throw e;
		}
		finally
		{
			nwui.lockStoryDirectory();
		};
	},

	/**
	 Deletes a story file from the file system. If a problem occurs,
	 then a notification is shown to the user.

	 @method deleteStoryFile
	 @param {Story} story Story model to delete
	**/

	deleteStoryFile: function (story)
	{
		try
		{
			nwui.unlockStoryDirectory();
			nwui.fs.unlinkSync(nwui.filePath + this.get('name') + '.html');
		}
		catch (e)
		{
			ui.notify('An error occurred while deleting your story (' + e.message + ').', 'danger');
		}
		finally
		{
			nwui.lockStoryDirectory();
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

		var allStories = StoryCollection.all();

		while (allStories.length > 0)
			allStories.at(0).destroy();

		// read from files

		nwui.unlockStoryDirectory();
		var fileStories = nwui.fs.readdirSync(nwui.filePath);

		_.each(fileStories, function (filename)
		{
			if (filename.match(/\.html$/))
				window.app.importFile(nwui.fs.readFileSync(nwui.filePath + filename, { encoding: 'utf-8' }));
		});

		nwui.unlockStoryDirectory();
		nwui.syncFs = true;
	},

	/**
	 Locks the story directory to prevent the user from changing it
	 outside of Twine. The init() method must be called first.

	 @method lockStoryDirectory
	**/

	lockStoryDirectory: function()
	{
		try
		{
			var stat = nwui.fs.statSync(nwui.filePath);
			nwui.fs.chmodSync(nwui.filePath, stat.mode ^ 128); // u-w
		}
		catch (e)
		{
			ui.notify('An error occurred while locking your library (' + e.message + ').', 'danger');
		};
	},

	/**
	 Unlocks the story directory. The init() method must be called
	 first.

	 @method lockStoryDirectory
	**/

	unlockStoryDirectory: function()
	{
		try
		{
			var stat = nwui.fs.statSync(nwui.filePath);
			nwui.fs.chmodSync(nwui.filePath, stat.mode | 128); // u+w
		}
		catch (e)
		{
			ui.notify('An error occurred while unlocking your library (' + e.message + ').', 'danger');
		};
	},
};

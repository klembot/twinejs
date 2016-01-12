/*
# nwui

Exports functions which adapts the Twine interface for NW.js, adding menus and
syncing changes to the filesystem. This takes the approach of patching
existing classes instead of creating a separate set of classes just for NW.js,
to try to keep things as similar as possible.
*/

'use strict';
var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var archive = require('../data/archive');
var locale = require('../locale');
var notify = require('../ui/notify');
var Passage = require('../data/passage');
var StorageQuota = require('../story-list/storage-quota');
var Story = require('../data/story');
var StoryCollection = require('../data/stories');
var StoryListView = require('../story-list/view');
var WelcomeView = require('../welcome/view');
var startupErrorTemplate = require('./startup-error.ejs');
var welcomeViewPatch = require('./welcome-view-patch.ejs');

var nwui = {
	/*
	Whether Twine is running in a NW.js environment.
	@property active
	@static
	@type Boolean
	*/
	active: window.nwDispatcher !== undefined,

	/*
	When false, data changes to a story will not be saved to the filesystem.
	This is mainly so that internal functions in this module can do their work
	without tripping over each other.
	@property syncFs
	@static
	@type Boolean
	*/

	syncFs: true,

	/*
	While the app is open, we lock story files in the filesystem so
	that the user can't make changes outside of Twine. This indexes
	the locks we maintain on these files so we can lift one when
	deleting a file.
	@property fileLocks
	@static
	@type Object
	*/

	fileLocks: {},

	/*
	Performs one-time initialization, e.g. setting up menus.
	This should be called as early in the app initialization process
	as possible.
	@method initialize
	@static
	*/

	initialize: function() {
		var startupTask = 'beginning startup tasks';

		try {
			/*
			An instance of the nw.gui module, for manipulating the native UI.
			@property gui
			@static
			@type module
			*/
			nwui.gui = require('nw.gui');

			startupTask = 'setting up menus';

			var win = nwui.gui.Window.get();
			var nativeMenuBar = new nwui.gui.Menu({ type: 'menubar' });
			var mainMenu;

			if (process.platform == 'darwin') {
				// Create Mac menus.

				nativeMenuBar.createMacBuiltin(window.app.name);
				mainMenu = _.findWhere(nativeMenuBar.items, { label: '' });

				/*
				Add fullscreen menu item. This is only on OS X for now -- it's
				hard hard for users to reverse on other platforms if they don't
				remember the keyboard shortcut.
				*/

				mainMenu.submenu.insert(new nwui.gui.MenuItem({
					label: locale.say('Toggle Fullscreen'),
					key: 'f',
					modifiers: 'cmd-shift',
					click: function() {
						nwui.gui.Window.get().toggleFullscreen();
					}
				}), 0);
			}
			else {
				// Create a basic menu on other platforms.

				mainMenu = new nwui.gui.MenuItem({
					label: window.app.name,
					submenu: new nwui.gui.Menu()
				});

				mainMenu.submenu.append(new nwui.gui.MenuItem({
					label: locale.say('Quit'),
					key: 'q',
					modifiers: 'ctrl',
					click: function() {
						nwui.gui.App.closeAllWindows();
					}
				}));

				mainMenu.submenu.insert(
					new nwui.gui.MenuItem({type: 'separator'}),
					0
				);
				nativeMenuBar.append(mainMenu);

				// And a stand-in Edit menu

				var editMenu = new nwui.gui.MenuItem({
					label: locale.say('Edit'),
					submenu: new nwui.gui.Menu()
				});

				editMenu.submenu.append(new nwui.gui.MenuItem({
					label: locale.say('Undo'),
					key: 'z',
					modifiers: 'ctrl',
					click: function() {
						document.execCommand('undo');
					}
				}));

				editMenu.submenu.append(new nwui.gui.MenuItem({ type: 'separator' }));

				editMenu.submenu.append(new nwui.gui.MenuItem({
					label: locale.say('Cut'),
					key: 'x',
					modifiers: 'ctrl',
					click: function() {
						document.execCommand('cut');
					}
				}));

				editMenu.submenu.append(new nwui.gui.MenuItem({
					label: locale.say('Copy'),
					key: 'c',
					modifiers: 'ctrl',
					click: function() {
						document.execCommand('copy');
					}
				}));

				editMenu.submenu.append(new nwui.gui.MenuItem({
					label: locale.say('Paste'),
					key: 'v',
					modifiers: 'ctrl',
					click: function() {
						document.execCommand('paste');
					}
				}));

				editMenu.submenu.append(new nwui.gui.MenuItem({
					label: locale.say('Delete'),
					click: function() {
						document.execCommand('delete');
					}
				}));

				nativeMenuBar.append(editMenu);
			}

			// Add a menu item to show story library.

			/*
			An instance of the node path module.
			@property path
			@static
			@type module
			*/
			nwui.path = require('path');

			mainMenu.submenu.insert(new nwui.gui.MenuItem({
				label: locale.say('Show Library'),
				click: function() {
					nwui.gui.Shell.openItem(nwui.filePath.replace(/\//g, nwui.path.sep));
				}
			}), 0);

			win.menu = nativeMenuBar;
			startupTask = 'setting window properties';

			/*
			Show the window once we're finished loading. It starts hidden via
			a setting in package.json.
			*/

			window.onload = function() {
				win.show();
				win.focus();
				_.delay(function() {
					/*
					When the window appears, the first button will be focused,
					which looks a little funny. This fixes that.
					*/

					$('button').blur();
				});
			};

			// Add a Shift-Ctrl-Alt-D shortcut for displaying dev tools.

			startupTask = 'adding the debugger keyboard shortcut';

			var $body = $('body');

			$body.on('keyup', function(e) {
				if (e.which == 68 && e.shiftKey && e.altKey && e.ctrlKey) {
					win.showDevTools();
				}
			});

			// Create ~/Documents/Twine if it doesn't exist.

			startupTask = 'initializing filesystem functions';

			/*
			An instance of the fs modules, for working with the native filesystem.
			@property fs
			@static
			@type module
			*/
			nwui.fs = require('fs');
			startupTask = 'checking for the presence of a Documents or ' +
				'My Documents directory in your user directory';

			/*
			We require this here instead of at the top of the file so that on
			the web platform, it doesn't try to do any detection (and fail,
			because we are not shimming `process`).
			*/

			nwui.osenv = require('osenv');
			var homePath = nwui.osenv.home();

			/*
			If the user doesn't have a Documents folder, check for "My
			Documents" instead (thanks Windows).
			*/

			/*
			L10n: This is the folder name on OS X, Linux, and recent versions of
			Windows that a user's documents are stored in, relative to the
			user's home directory. If you need to use a space in this name,
			then it should have two backslashes (\\) in front of it.
			Regardless, this must have a single forward slash (/) as its first
			character.
			*/
			var docPath = nwui.path.join(homePath, locale.say('/Documents'));

			if (!nwui.fs.existsSync(docPath)) {
				startupTask =
					'creating a My Documents directory in your user directory';

				var myDocumentsPath =
					nwui.path.join(homePath, locale.say('/My\\ Documents'));

				/*
				L10n: This is the folder name on Windows XP that a user's
				documents are stored in, relative to the user's home directory.
				This is used if a folder with the name given by the translation
				key '/Documents' does not exist. If you need to use a space in
				this name, then it should have two backslashes (\\) in front of
				it. Regardless, this must have a single forward slash (/) as
				its first character.
				*/
				if (nwui.fs.existsSync(myDocumentsPath)) {
					docPath = nwui.path.join(homePath, locale.say('/My\\ Documents'));
				}
				else {
					nwui.fs.mkdirSync(docPath);
				}
			}

			startupTask = 'checking for the presence of a Twine directory ' +
				'in your Documents directory';

			/*
			The path that stories will be saved to in the filesystem.
			@property filePath
			@static
			@type String
			*/

			/*
			L10n: '/Twine' is a suitable name for Twine-related files to exist
			under on the user's hard drive. '/Stories' is a suitable name for
			story files specifically. If you need to use a space in this name,
			then it should have two backslashes in front of it. Regardless,
			this must have a single forward slash (/) as its first character.
			*/
			nwui.filePath = nwui.path.join(
				docPath, locale.say('/Twine'), locale.say('/Stories')
			);

			if (!nwui.fs.existsSync(nwui.filePath)) {
				startupTask = 'creating a Twine directory in your Documents directory';
				var twinePath = nwui.path.join(docPath, locale.say('/Twine'));

				if (!nwui.fs.existsSync(twinePath)) { nwui.fs.mkdirSync(twinePath); }

				nwui.fs.mkdirSync(nwui.filePath);
			}

			/*
			Do a file sync if we're just starting up. We have to stuff this in
			the global scope; otherwise, each new window will think it's
			starting afresh and confuse our model IDs.
			*/

			if (!global.nwuiFirstRun) {
				startupTask = 'initially synchronizing story files';
				nwui.syncStoryFiles();
				startupTask = 'initially locking your Stories directory';
				nwui.lockStoryDirectory();
				global.nwuiFirstRun = true;
			}

			startupTask = 'setting up a handler for external links';

			// Add a handler to open external links outside the app.

			$body.on('click', 'a', function(e) {
				var url = $(this).attr('href');

				if (typeof url == 'string' && url.match(/^https?:/)) {
					nwui.gui.Shell.openExternal(url);
					e.preventDefault();
				}
			});

			startupTask = 'setting up shutdown tasks';

			// When quitting, unlock the story directory.

			process.on('exit', function() {
				nwui.unlockStoryDirectory();
			});

			/*
			Monkey patch the `data/story` module to save to a file under
			`~/Documents/Twine` whenever the model changes, or delete it when
			it is destroyed.
			*/

			startupTask = 'adding a hook to automatically save stories';

			var oldStoryInit = Story.prototype.initialize;

			Story.prototype.initialize = function() {
				oldStoryInit.call(this);

				this.on('change', _.throttle(function() {
					/*
					If the only thing that is changing is last modified date,
					then skip it.
					*/

					var changedAttributes = _.keys(this.changedAttributes());
					var isLastUpdatedOnly = !_.some(
						changedAttributes,
						function(key) {
							return (key != 'lastUpdated');
						}
					);

					if (isLastUpdatedOnly) { return; }

					/*
					If we aren't syncing changes or the story has no passages,
					give up early.
					*/

					if (!nwui.syncFs || this.fetchPassages().length === 0) {
						return;
					}

					nwui.saveStoryFile(this);
				}, 100), this);

				this.on('destroy', function() {
					if (!nwui.syncFs) { return; }

					nwui.deleteStoryFile(this);
				}, this);
			};

			/*
			Monkey patch the `data/passage` module to save its parent story
			whenever it is changed or destroyed.
			*/

			startupTask =
				'adding a hook to automatically save a story after editing a passage';

			var oldPassageInit = Passage.prototype.initialize;

			Passage.prototype.initialize = function() {
				oldPassageInit.call(this);

				this.on('change destroy', _.debounce(function() {
					if (!nwui.syncFs) { return; }

					// If we have no parent, skip it
					// (this happens during an import, for example)

					var parent = this.fetchStory();

					if (parent) { nwui.saveStoryFile(parent); }
				}, 100), this);
			};

			/*
			Monkey patch the `story-list/storage-quota` module to hide itself,
			since we don't have to sweat quota ourselves.
			*/

			startupTask = 'disabling the storage quota meter';

			StorageQuota.prototype.render = function() {
				this.$el.css('display', 'none');
			};

			/*
			Monkey patch the `story-list` module to open the wiki in the user's
			browser and to hold off on trying to update the filesystem
			midprocess.
			*/

			startupTask = 'setting up the Help link';

			StoryListView.prototype.events['click .showHelp'] = function() {
				nwui.gui.Shell.openExternal('http://twinery.org/2guide');
			};

			startupTask = 'setting up a hook for importing story files';

			var oldStoryListViewImportFile = StoryListView.prototype.importFile;

			StoryListView.prototype.importFile = function(e) {
				nwui.syncFs = false;
				var reader = oldStoryListViewImportFile.call(this, e);

				reader.addEventListener('load', function() {
					/*
					Deferred to make sure that the normal event handler fires
					first.
					*/

					_.defer(function() {
						nwui.syncFs = true;
						StoryCollection.all().each(nwui.saveStoryFile);
					});
				});
			};

			/*
			Monkey patch the `welcome/view` module to display a different
			message about saving.
			*/

			startupTask = 'customizing the initial welcome page';

			var oldWelcomeViewRender = WelcomeView.prototype.onRender;

			WelcomeView.prototype.onRender = function() {
				this.$('.save').html(Marionette.Renderer.render(welcomeViewPatch, {}));
				oldWelcomeViewRender.call(this);
			};
		}
		catch (e) {
			/*eslint-disable no-console*/
			console.log('Startup crash', startupTask, e);
			/*eslint-enable no-console*/
			document.write(startupErrorTemplate({task: startupTask, error: e}));
			throw e;
		}
	},

	// jscs:disable maximumLineLength

	/*
	Returns a filename for a story model that's guaranteed to be
	safe across all platforms. For this, we use POSIX's definition
	(http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_276)
	with the addition of spaces, for legibility.

	@method storyFileName
	@static
	@param {Story} story Story model to create filename for
	@return {String} filename
	**/

	// jscs:enable maximumLineLength

	storyFileName: function(story) {
		return story.get('name').replace(/[^\w\. -]/g, '_') + '.html';
	},

	/*
	Saves a story model to the file system. If a problem occurs, then a
	notification is shown to the user.

	@method saveStoryFile
	@static
	@param {Story} story Story model to save
	*/

	saveStoryFile: function(story) {
		try {
			nwui.unlockStoryDirectory();

			var fd =
				nwui.fs.openSync(nwui.filePath + '/' +
				nwui.storyFileName(story), 'w');

			nwui.fs.writeSync(fd, story.publish(null, null, true));
			nwui.fs.closeSync(fd);
		}
		catch (e) {
			// L10n: %s is the error message.
			notify(
				locale.say(
					'An error occurred while saving your story (%s).',
					e.message
				),
				'danger'
			);
			throw e;
		}
		finally {
			nwui.lockStoryDirectory();
		}
	},

	/*
	Deletes a story file from the file system. If a problem occurs,
	then a notification is shown to the user.

	@method deleteStoryFile
	@static
	@param {Story} story Story model to delete
	*/

	deleteStoryFile: function(story) {
		try {
			nwui.unlockStoryDirectory();
			nwui.fs.unlinkSync(nwui.filePath + '/' + nwui.storyFileName(story));
		}
		catch (e) {
			// L10n: %s is the error message.
			notify(
				locale.say(
					'An error occurred while deleting your story (%s).',
					e.message
				),
				'danger'
			);
		}
		finally {
			nwui.lockStoryDirectory();
		}
	},

	/*
	Syncs local storage with the file system, obliterating
	any stories that happen to be saved to local storage only.
	@method syncStoryFiles
	@static
	*/

	syncStoryFiles: function() {
		nwui.syncFs = false;

		// Clear all existing stories and passages
		// FIXME

		var allStories = StoryCollection.all();

		while (allStories.length > 0) { allStories.at(0).destroy(); }

		// Read from files

		nwui.unlockStoryDirectory();

		var fileStories = nwui.fs.readdirSync(nwui.filePath);

		_.each(fileStories, function(filename) {
			if (filename.match(/\.html$/)) {
				var stats = nwui.fs.statSync(nwui.filePath + '/' + filename);

				archive.import(
					nwui.fs.readFileSync(
						nwui.filePath + '/' + filename,
						{ encoding: 'utf-8' }
					),
					new Date(Date.parse(stats.mtime))
				);
			}
		});

		nwui.unlockStoryDirectory();
		nwui.syncFs = true;
	},

	/*
	Locks the story directory to prevent the user from changing it
	outside of Twine. The init() method must be called first.
	@method lockStoryDirectory
	@static
	*/

	lockStoryDirectory: function() {
		try {
			if (process.platform == 'win32') {
				_.each(nwui.fs.readdirSync(nwui.filePath), function(filename) {
					// A-w, 0444
					nwui.fs.chmodSync(nwui.filePath + '/' + filename, 292);
				});
			}
			else {
				var stat = nwui.fs.statSync(nwui.filePath);

				// U-w
				nwui.fs.chmodSync(nwui.filePath, stat.mode ^ 128);
			}
		}
		catch (e) {
			// L10n: Locking in the sense of preventing changes to a file.
			// %s is the error message.
			notify(
				locale.say(
					'An error occurred while locking your library (%s).',
					e.message
				),
				'danger'
			);
		}
	},

	/*
	Unlocks the story directory. The `initialize()` method must be called first.
	@method unlockStoryDirectory
	@static
	*/

	unlockStoryDirectory: function() {
		try {
			if (process.platform == 'win32') {
				_.each(
					nwui.fs.readdirSync(nwui.filePath),
					function(filename) {
						// A+w, 0666
						nwui.fs.chmodSync(nwui.filePath + '/' + filename, 438);
					}
				);
			}
			else {
				var stat = nwui.fs.statSync(nwui.filePath);

				// U+w
				nwui.fs.chmodSync(nwui.filePath, stat.mode | 128);
			}
		}
		catch (e) {
			// L10n: Unlocking in the sense of allowing changes to a file.
			// %s is the error message.
			notify(
				locale.say(
					'An error occurred while unlocking your library (%s).',
					e.message
				),
				'danger'
			);
		}
	}
};

module.exports = nwui;

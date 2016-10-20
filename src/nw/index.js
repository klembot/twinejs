/**
 A singleton that adapts the Twine interface for NW.js, adding menus and
 syncing changes to the filesystem.  This takes the approach of patching
 existing classes instead of creating a separate set of classes just for NW.js,
 to try to keep things as similar as possible.

 @module nwui
**/

module.exports = {
	// Performs one-time initialization, e.g. setting up menus. This should be
	// called as early in the app initialization process as possible.

	init() {
		try {
			require('nw.gui');
		}
		catch (e) {
			return;
		}

		require('core-js');

		const startupErrorTemplate = require('./startup-error.ejs');
		let startupTask = 'beginning startup tasks';

		try {
			const gui = require('nw.gui');
			const directories = require('./directories');
			const menus = require('./menus');
			const patchQuotaGauge = require('./patches/quota-gauge');
			const patchStore = require('./patches/store');
			const patchStoryListToolbar = require('./patches/story-list-toolbar');
			const patchWelcomeView = require('./patches/welcome-view');
			const storyFile = require('./story-file');

			const win = gui.Window.get();

			// Set up our menus.

			startupTask = 'setting up menus';
			menus.addTo(win);

			// Show the window once we've finished loading.

			startupTask = 'setting window properties';

			win.on('loaded', () => {
				win.show();
				win.focus();
			});

			// Add a shift-ctrl-alt-D shortcut for displaying dev tools.

			startupTask = 'adding the debugger keyboard shortcut';

			document.addEventListener('keyup', e => {
				if (e.which == 68 && e.shiftKey && e.altKey && e.ctrlKey) {
					win.showDevTools();
				}
			});

			// Create ~/Documents/Twine if it doesn't exist.

			startupTask = 'checking for the presence of a Documents or My ' +
				'Documents directory in your user directory';

			directories.createPath(directories.storiesPath());

			// Open external links outside the app.

			startupTask = 'setting up a handler for external links';

			document.addEventListener('click', function(e) {
				if (e.target.nodeName === 'A') {
					const url = e.target.getAttribute('url');

					if (typeof url == 'string' && url.match(/^https?:/)) {
						gui.Shell.openExternal(url);
						e.preventDefault();
					}
				}
			});

			// When quitting, unlock the story directory.

			startupTask = 'setting up shutdown tasks';
		
			process.on('exit', () => {
				directories.unlockStories();
			});

			// Do a file sync if we're just starting up. We have to track this
			// in the global scope; otherwise, each new window will think
			// it's starting afresh and screw up our model IDs.

			if (!global.nwFirstRun) {
				startupTask = 'initially synchronizing story files';
				storyFile.loadAll();
				startupTask = 'initially locking your Stories directory';
				directories.lockStories();
				global.nwFirstRun = true;
			}

			// Monkey patch the store module to save to a file
			// under ~/Documents/Twine whenever a story changes,
			// or delete it when it is deleted.

			startupTask = 'adding a hook to automatically save stories';
			patchStore(require('../data/store'));

			// Monkey patch QuotaGauge to hide itself, since we
			// don't have to sweat quota ourselves.

			startupTask = 'disabling the storage quota meter';
			patchQuotaGauge(require('../ui/quota-gauge'));

			// Monkey patch StoryListToolbar to open the wiki in the user's
			// browser.

			startupTask = 'setting up the Help link';
			patchStoryListToolbar(require('../story-list-view/list-toolbar'));

			// Monkey patch WelcomeView to hide information related to local
			// storage.

			startupTask = 'customizing the initial welcome page';
			patchWelcomeView(require('../welcome'));
		}
		catch (e) {
			console.error('Startup crash', startupTask, e);

			document.write(
				startupErrorTemplate({ task: startupTask, error: e })
			);
			require('nw.gui').Window.get().show();
			throw e;
		}
	}
};

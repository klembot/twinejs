/**
 A singleton that adapts the Twine interface for NW.js, adding menus and
 syncing changes to the filesystem.  This takes the approach of patching
 existing classes instead of creating a separate set of classes just for NW.js,
 to try to keep things as similar as possible.

 @module nwui
**/

module.exports = {
	/**
	Performs one-time initialization, e.g. setting up menus. This should be
	called as early in the app initialization process as possible.
	@return {Promise} Resolves only after initialization completes successfully
	**/

	init() {
		return new Promise(resolve => {
			/* eslint-disable no-inner-declarations */

			/*
			If we're not running in an NW.js context, do nothing.
			*/

			try {
				require('nw.gui');
			}
			catch (e) {
				resolve();
				return;
			}

			/*
			If we're not the story list, e.g. another window opened in NW for
			playing a story, then skip initialization.
			*/

			if (window.location.hash !== '') {
				resolve();
				return;
			}

			require('core-js');
			require('./index.less');

			const startupErrorTemplate = require('./startup-error.ejs');
			let startupTask = 'beginning startup tasks';

			try {
				const gui = require('nw.gui');
				const mkdirp = require('mkdirp');
				const directories = require('./directories');
				const locale = require('../locale');
				const menus = require('./menus');
				const patchQuotaGauge = require('./patches/quota-gauge');
				const patchStore = require('./patches/store');
				const patchStoryListToolbar = require('./patches/story-list-toolbar');
				const patchWelcomeView = require('./patches/welcome-view');
				const saveQueue = require('./save-queue');
				const storyFile = require('./story-file');

				const win = gui.Window.get();

				/*
				Load our locale. This must happen right away, as it's used for
				directories and such. Because the rest of the app has not yet
				initialized, we need to fish out the user preference manually,
				which is rather ugly.

				This is mostly cribbed from data/local-storage/pref.js.
				*/

				const serialized = window.localStorage.getItem('twine-prefs');

				if (serialized) {
					let localeFound = false;

					serialized.split(',').forEach(id => {
						if (localeFound) {
							return;
						}

						try {
							const item = JSON.parse(
								window.localStorage.getItem('twine-prefs-' + id)
							);

							if (item.name === 'locale') {
								localeFound = true;
								locale.load(item.value, finishInit);
							}
						}
						catch (e) {
							/* Skip a bad value. */
						}
					});

					if (!localeFound) {
						finishInit();
					}
				}
				else {
					finishInit();
				}

				function finishInit() {
					try {
						/* Set up our menus. */
						
						startupTask = 'setting up menus';
						menus.addTo(win);

						/* Show the window once we've finished loading. */

						startupTask = 'setting window properties';

						win.on('loaded', () => {
							win.show();
							win.focus();
						});

						/*
						Add a shift-ctrl-alt-D shortcut for displaying dev
						tools. Note: this is deprecated as NW.js now lets you
						press F12 anywhere.
						*/

						startupTask = 'adding the debugger keyboard shortcut';

						document.addEventListener('keyup', e => {
							if (e.which === 68 && e.shiftKey && e.altKey
								&& e.ctrlKey) {
								win.showDevTools();
							}
						});

						/* Create ~/Documents/Twine if it doesn't exist. */

						startupTask = 'checking for the presence of a Documents or My ' +
							'Documents directory in your user directory';

						// FIXME: this is happening before the locale is loaded,
						// and accordingly, is broken

						mkdirp.sync(directories.storiesPath());

						/* Open external links outside the app. */

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

						/* When quitting, unlock the story directory. */

						startupTask = 'setting up shutdown tasks';

						gui.Window.get().on('close', function() {
							saveQueue.flush();
							directories.unlockStories();
							this.close(true);
						});

						/*
						Do a file sync if we're just starting up. We have to
						track this in the global scope; otherwise, each new
						window will think it's starting afresh and screw up our
						model IDs.
						*/

						startupTask = 'initially synchronizing story files';
						storyFile.loadAll();
						startupTask = 'initially locking your Stories directory';
						directories.lockStories();

						/*
						Monkey patch the store module to save to a file under
						~/Documents/Twine whenever a story changes, or delete it
						when it is deleted.
						*/

						startupTask = 'adding a hook to automatically save stories';
						patchStore(require('../data/store'));

						/*
						Monkey patch QuotaGauge to hide itself, since we don't
						have to sweat quota ourselves.
						*/

						startupTask = 'disabling the storage quota meter';
						patchQuotaGauge(require('../ui/quota-gauge'));

						/*
						Monkey patch StoryListToolbar to open the wiki in the
						user's browser.
						*/

						startupTask = 'setting up the Help link';
						patchStoryListToolbar(require('../story-list-view/list-toolbar'));

						/*
						Monkey patch WelcomeView to hide information related to
						local storage.
						*/

						startupTask = 'customizing the initial welcome page';
						patchWelcomeView(require('../welcome'));

						resolve();
					}
					catch (e) {
						showCrash(e);
						throw e;
					}
				}
			}
			catch (e) {
				showCrash(e);
				throw e;

				/*
				Don't resolve our promise so that the startup process freezes.
				*/
			}

			function showCrash(error) {
				/* Show the user the error and halt. */

				/* eslint-disable no-console */
				console.error('Startup crash', startupTask, error);
				/* eslint-enable no-console */

				document.write(
					startupErrorTemplate({ task: startupTask, error: error })
				);
				require('nw.gui').Window.get().show();
			}
		
			/* eslint-enable no-inner-declarations */
		});
	}
};

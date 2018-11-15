/* Sets up menus in the NW.js version. */

module.exports = {
	/* Adds menus to a NW.js window. */

	addTo(win) {
		const directories = require('./directories');
		const gui = require('nw.gui');
		const locale = require('../locale');
		const path = require('path');
		const nativeMenuBar = new gui.Menu({ type: 'menubar' });
		let mainMenu;

		if (global.process.platform === 'darwin') {
			/* Create Mac menus. */

			nativeMenuBar.createMacBuiltin(locale.say('Twine'));
			mainMenu = nativeMenuBar.items.filter(item => item.label === '')[0];

			/*
			Add a fullscreen item. This is on OS X only for now, because it's
			hard to reverse on other platforms if you don't remember the
			keyboard shortcut.
			*/

			mainMenu.submenu.insert(new gui.MenuItem({
				label: locale.say('Toggle Fullscreen'),
				key: 'f',
				modifiers: 'cmd-shift',
				click() {
					win.toggleFullscreen();
				}
			}), 0);
		}
		else {
			/* Create a basic menu on other platforms. */

			mainMenu = new gui.MenuItem({
				label: locale.say('Twine'),
				submenu: new gui.Menu()
			});

			mainMenu.submenu.append(new gui.MenuItem({
				label: locale.say('Quit'),
				key: 'q',
				modifiers: 'ctrl',
				click() {
					gui.App.closeAllWindows();
				}
			}));

			mainMenu.submenu.insert(
				new gui.MenuItem({ type: 'separator' }),
				0
			);
			nativeMenuBar.append(mainMenu);

			/* ... And a stand-in Edit menu. */

			const editMenu = new gui.MenuItem({
				label: locale.say('Edit'),
				submenu: new gui.Menu()
			});

			editMenu.submenu.append(new gui.MenuItem({
				label: locale.say('Undo'),
				key: 'z',
				modifiers: 'ctrl',
				click() {
					document.execCommand('undo');
				}
			}));

			editMenu.submenu.append(
				new gui.MenuItem({ type: 'separator' })
			);

			editMenu.submenu.append(new gui.MenuItem({
				label: locale.say('Cut'),
				key: 'x',
				modifiers: 'ctrl',
				click() {
					document.execCommand('cut');
				}
			}));

			editMenu.submenu.append(new gui.MenuItem({
				label: locale.say('Copy'),
				key: 'c',
				modifiers: 'ctrl',
				click() {
					document.execCommand('copy');
				}
			}));

			editMenu.submenu.append(new gui.MenuItem({
				label: locale.say('Paste'),
				key: 'v',
				modifiers: 'ctrl',
				click() {
					document.execCommand('paste');
				}
			}));

			editMenu.submenu.append(new gui.MenuItem({
				label: locale.say('Delete'),
				click() {
					document.execCommand('delete');
				}
			}));

			nativeMenuBar.append(editMenu);
		}

		/* Add a menu item to show the story library. */

		mainMenu.submenu.insert(new gui.MenuItem({
			label: locale.say('Show Library'),
			click() {
				gui.Shell.openItem(
					directories.storiesPath().replace(/\//g, path.sep)
				);
			}
		}), 0);

		win.menu = nativeMenuBar;
	}
};

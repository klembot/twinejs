// Patches the story list toolbar so that the help link opens the wiki
// externally.

module.exports = (StoryListToolbar) => {
	StoryListToolbar.options.methods.showHelp = () => {
		const gui = require('nw.gui');

		gui.Shell.openExternal('https://twinery.org/2guide');
	};
};

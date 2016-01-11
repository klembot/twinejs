/*
# ui/replace

Completely replaces the document with HTML source, and cleans up global
variables set up in the app. This is done when playing a story, so that the
story format does not have any pre-existing content to contend with -- this led
to false impressions in the past, for example, that Underscore was built into
story formats.
*/

'use strict';
var ui = require('./index.js');

module.exports = function(html) {
	// Remove our UI hooks.

	ui.destroy();

	// Blast the last of our JS globals.

	window.CodeMirror = null;
	window.SVG = null;
	window.Store = null;
	window.StoryFormat = null;
	window.amdDefine = null;
	window.app = null;
	window.jQuery = null;

	// Rewrite the document.

	document.open();
	/* jshint -W060 */
	document.write(html);
	/* jshint +W060 */
	document.close();
};

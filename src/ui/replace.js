/**
 Completely replaces the document with HTML source.

 @method replaceContent
 @param {String} html HTML source to replace, including DOCTYPE, <head>, and
	<body>.
**/

'use strict';
const ui = require('./index.js');

module.exports = html => {
	// remove our UI hooks

	ui.destroy();

	// blast the last of our JS globals

	window.CodeMirror = null;
	window.SVG = null;
	window.Store = null;
	window.StoryFormat = null;
	window.amdDefine = null;
	window.app = null;
	window.jQuery = null;

	// rewrite the document

	document.open();
	/* jshint -W060 */
	document.write(html);
	/* jshint +W060 */
	document.close();
};

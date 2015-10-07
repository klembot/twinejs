/**
 Completely replaces the document with HTML source.

 @method replaceContent
 @param {String} html HTML source to replace, including DOCTYPE, <head>, and <body>.
**/

'use strict';
var $ = require('jquery');
var ui = require('./index.js');

module.exports = function (html)
{
	// remove our UI hooks

	ui.destroy();

	// blast the last of our JS globals

	CodeMirror = null;
	CustomEvent = null;
	SVG = null;
	Store = null;
	StoryFormat = null;
	amdDefine = null;
	app = null;
	jQuery = null;

	// rewrite the document

	document.open();
	/* jshint -W060 */
	document.write(html);
	/* jshint +W060 */
	document.close();
};

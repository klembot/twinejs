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

	// rewrite the document

	document.open();
	/* jshint -W060 */
	document.write(html);
	/* jshint +W060 */
	document.close();
};

/**
 Saves data to a file. This appears to the user as if they had clicked a link
 to a downloadable file in their browser. If no failure method is specified,
 then this will show a UI notification when errors occur.

 @module file/save
 @param {String} data data to save
 @param {String} filename filename to save to
 @param {Function} success callback function on a successful save, optional
 @param {Function} failure callback function on a failed save (passed error),
	optional
**/

'use strict';
const $ = require('jquery');
const JSZip = require('jszip');
const saveAs = require('browser-saveas');
const locale = require('../locale');
const notify = require('../ui/notify');

require('blob-polyfill');

module.exports = (data, filename, success, failure) => {
	try {
		const $b = $('body');

		if (!$b.hasClass('iOS')) {
			// standard style

			const blob = new Blob([data], { type: 'text/html;charset=utf-8' });

			// Safari requires us to use saveAs in direct response
			// to a user event, so we punt and use a data: URI instead
			// we can't even open it in a new window as that seems to
			// trigger popup blocking

			if ($b.hasClass('safari')) {
				window.location.href = URL.createObjectURL(blob);
			}
			else {
				saveAs(blob, filename);
			}

			if (success) {
				success();
			}
		}
		else {
			// package it into a .zip; this will trigger iOS to try to
			// hand it off to Google Drive, Dropbox, and the like

			const zip = new JSZip();

			zip.file(filename, data);
			window.location.href =
				'data:application/zip;base64, ' +
				zip.generate({ type: 'base64' });

			if (success) {
				success();
			}
		};
	}
	catch (e) {
		if (failure) {
			failure(e);
		}
		else {
			// L10n: %1$s is a filename; %2$s is the error message.
			notify(
				locale.say(
					'&ldquo;%1$s&rdquo; could not be saved (%2$s).',
					filename,
					e.message
				),
				'danger'
			);
		}
	};
};

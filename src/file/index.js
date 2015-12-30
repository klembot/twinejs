'use strict';
var $ = require('jquery');
var JSZip = require('jszip');
var saveAs = require('browser-saveas');
require('blob-polyfill');

module.exports = {
  readInputEl: function(el, callback) {
    var reader = new FileReader();

    reader.addEventListener('load', function(e) {
      callback(e);
    });

    reader.readAsText(el.files[0], 'UTF-8');
    return reader;
  },

  /**
    Saves data to a file synchronously. This appears to the user as if they
    had clicked a link to a downloadable file in their browser. If this fails,
    an error will be thrown.

    @param {String} data data to save
    @param {String} filename filename to save to
    @param {Function} callback callback function on a successful save, optional
  **/

  save: function(data, filename, callback) {
    var $b = $('body');

    if (!$b.hasClass('iOS')) {
      // Standard style

      var blob = new Blob([data], { type: 'text/html;charset=utf-8' });

      // Safari requires us to use saveAs in direct response
      // to a user event, so we punt and use a data: URI instead
      // we can't even open it in a new window as that seems to
      // trigger popup blocking

      if ($b.hasClass('safari')) {
        window.location.href = URL.createObjectURL(blob);
      } else {
        saveAs(blob, filename);
      }


      if (callback) {
        callback();
      }
    } else {
      // Package it into a .zip; this will trigger iOS to try to
      // hand it off to Google Drive, Dropbox, and the like

      var zip = new JSZip();
      zip.file(filename, data);
      window.location.href = 'data:application/zip;base64, ' +
          zip.generate({ type: 'base64' });

      if (callback) {
        callback();
      }
    }
  },
};

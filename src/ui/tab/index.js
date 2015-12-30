'use strict';
var $ = require('jquery');
var ui = require('./index');
// Require('../jquery-ext/tab');

$(ui)
  .on('init', function(e, options) {
    options.$body.on('click.twineui', '.tabs button', function() {
      // Click handler for tabs

      $(this).tab();
    });
  })
  .on('attach', function(e, options) {
    // Show first tab in each group

    options.$el.find('.tabs button:first-of-type').tab();
  });

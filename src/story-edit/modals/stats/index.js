/**
 Shows statistics about the story being edited.

 @class StatsModal
 @extends Backbone.View
 **/

'use strict';
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var modal = require('../../../ui/modal');
var modalTemplate = require('./modal.ejs');

module.exports = Marionette.ItemView.extend({
  /**
   Opens the modal dialog.

   @method open
   **/

  open: function(story) {
    // Calculate counts

    var counts = {
      chars: 0,
      words: 0,
      passages: 0,
      links: 0,
      brokenLinks: 0,
      lastUpdate: story.get('lastUpdate'),
      ifid: story.get('ifid'),
    };

    var passageLinks = {};
    var passageNames = [];

    story.fetchPassages().each(function(passage) {
      counts.passages++;
      var text = passage.get('text');
      counts.chars += text.length;
      counts.words += text.split(/\s+/).length;
      var links = passage.links();
      counts.links += links.length;
      passageNames.push(passage.get('name'));

      _.each(links, function(link) {
        passageLinks[link] = (passageLinks[link] || 0) + 1;
      });
    });

    // We calculate broken links now that we have
    // a complete list of names

    _.each(passageLinks, function(count, name) {
      if (passageNames.indexOf(name) == -1) {
        counts.brokenLinks += count;
      }
    });

    modal.open({
      content: Marionette.Renderer.render(modalTemplate, counts),
    });
  },
});

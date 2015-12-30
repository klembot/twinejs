/**
  This class generates SVG previews of stories.
  @class StoryItemView.Preview
**/

'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var SVG = require('svg.js');
var data = require('../../data');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    /**
     The parent item view.

     @property parent
     **/

    this.parent = options.parent;
    this.story = options.story;

    /**
     Whether we have rendered our passages onscreen.

     @property rendered
     **/

    this.rendered = false;

    /**
     The SVG element on the page.
     @property svg
     **/

    this.svg = SVG(this.el);

    /**
     A hue derived from the story's name,
     represented as the H part of an HSL color.

     @property hue
     **/

    this.hue = 0;

    var storyName = this.story.get('name');

    for (var i = storyName.length - 1; i >= 0; i--) {
      this.hue += storyName.charCodeAt(i);
    }

    this.hue = this.hue % 360;

    // Set overall background color

    this.$el.closest('.story').css(
      'background',
      'hsl(' + this.hue + ', 25%, 92%)'
    );

    // Set background color of footer

    this.parent.$('footer').css(
      'background-color',
      'hsl(' + this.hue + ', 50%, 50%)'
    );
  },

  /**
   Renders a visualization of passages.

   @method renderPassages
   @param {Function} callback If passed, will be called once rendering
   completes
   **/

  render: function(callback) {
    var passages = data.passagesForStory(this.story);

    if (passages.length > 1) {
      // Find longest passage

      var maxLength = 0;

      passages.forEach(function(passage) {
        var len = passage.get('text').length;

        if (len > maxLength) {
          maxLength = len;
        }
      });

      // Render passages

      var c1 = 'hsl(' + this.hue + ', 88%, 40%)';
      var c2 = 'hsl(' + ((this.hue - 30) % 360) + ', 88%, 40%)';
      var c3 = 'hsl(' + ((this.hue + 30) % 360) + ', 88%, 40%)';

      var minX = Number.POSITIVE_INFINITY;
      var minY = Number.POSITIVE_INFINITY;
      var maxX = Number.NEGATIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;

      passages.forEach(function renderPassage(passage, i) {
        var ratio = passage.get('text').length / maxLength;
        var size = 100 + 200 * ratio;
        var x = passage.get('left');
        var y = passage.get('top');
        var c = this.svg.circle().center(x + 50, y + 50).radius(size / 2);

        if (i % 3 === 0) {
          c.fill({color: c1, opacity: ratio * 0.9});
        } else if (i % 2 === 0) {
          c.fill({color: c2, opacity: ratio * 0.9});
        } else {
          c.fill({color: c3, opacity: ratio * 0.9});
        }

        if (x - size < minX) {
          minX = x - size;
        }

        if (x + size > maxX) {
          maxX = x + size;
        }

        if (y - size < minY) {
          minY = y - size;
        }

        if (y + size > maxY) {
          maxY = y + size;
        }
      }.bind(this));

      this.svg.viewbox(
        minX,
        minY,
        Math.abs(minX) + maxX,
        Math.abs(minY) + maxY
      );
    } else {
      // Special case single or no passage

      if (passages.length == 1) {
        this.svg.circle()
          .center(5, 5)
          .fill('hsl(' + this.hue + ', 88%, 40%)')
          .radius(2.5);
        this.svg.viewbox(0, 0, 10, 10);
      }
    }

    this.rendered = true;

    if (callback) {
      callback();
    }
  },
});

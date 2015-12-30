'use strict';
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Bubble = require('../../ui/bubble');
var menuTemplate = require('./menu.ejs');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.parent = options.parent;
    this.trigger = options.trigger;
    this.content = Marionette.Renderer.render(menuTemplate);

    this.bubble = new Bubble({
      parent: this.trigger[0],
      content: this.content,
      position: 'bottom',
    });

    this.setElement(this.bubble.content());
  },

  events: {
    'click .confirmDelete': function() {
      this.parent.confirmDelete();
    },

    'click .confirmDuplicate': function() {
      this.parent.confirmDuplicate();
    },

    'click .rename': function() {
      this.parent.rename();
    },

    'click .edit': function() {
      this.parent.edit();
    },

    'click .play': function() {
      this.parent.play();
    },

    'click .test': function() {
      this.parent.test();
    },

    'click .publish': function() {
      this.parent.publish();
    },
  },
});

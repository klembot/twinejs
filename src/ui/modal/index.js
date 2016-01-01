'use strict';
var _ = require('underscore');
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var modalTemplate = require('./modal.ejs');

module.exports = {
  defaults: {
    classes: '',
  },

  open: function(options) {
    this.$modal = $(
      Marionette.Renderer.render(
        modalTemplate, _.defaults(options, this.defaults)
      )
    );
    this.$modal.on('click', '[data-modal="close"]', this.close.bind(this));

    // Block keyboard events

    $(document).on(
      'keydown.twineui keypress.twineui keyup.twineui',
      function(e) {
        // Escape key closes

        if (e.type == 'keydown' && e.keyCode == 27) {
          this.close();
        }

        e.stopImmediatePropagation();
      }.bind(this)
    );

    // Add appearance animation and modalOpen event

    this.$modal
      .addClass('fadeIn')
      .one('animationend', function() {
        this.$modal.trigger('modalOpen.twineui');
      }.bind(this))
      .find('#modal')
      .addClass('appear');

    // Trigger modalOpening event after execution stack completes

    _.defer(function() {
      this.$modal.trigger('modalOpening.twineui');
    }.bind(this));

    $('body').addClass('modalOpen').append(this.$modal);
    return this.$modal;
  },

  close: function() {
    // Trigger modalClosing event; bail if something canceled it

    var closingEvent = $.Event('modalClosing.twineui');
    this.$modal.trigger(closingEvent);

    if (closingEvent.isDefaultPrevented()) {
      return;
    }

    // Animate it closing, then remove it from the DOM

    this.$modal
      .removeClass('fadeIn')
      .addClass('fadeOut')
      .one('animationend', function() {
        this.$modal.trigger('modalClose.twineui').off('.twineui').remove();
        $('body').removeClass('modalOpen');
        $(document).off('.twineui');
      }.bind(this))
      .find('#modal')
      .removeClass('appear')
      .addClass('disappear');
  },
};

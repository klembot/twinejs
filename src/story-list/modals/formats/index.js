'use strict';
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var data = require('../../../data');
var locale = require('../../../locale');
var notify = require('../../../ui/notify');
var StoryFormat = require('../../../data/story-format');
var storyFormatTemplate = require('./item.ejs');
require('../../../ui/tab');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.parent = options.parent;
    this.itemTemplate = storyFormatTemplate;
  },

  /**
    Opens a modal dialog for editing default formats.

    @method open
  **/

  open: function() {
    this.$('.error').hide();

    // Begin loading formats immediately

    this.$('.storyFormatList, .proofingFormatList').empty();
    this.formatsToLoad = data.storyFormats;
    this.loadNextFormat();

    this.$el.data('modal').trigger('show');
  },

  /**
    Closes the modal dialog for editing default formats.

    @method close
  **/

  close: function() {
    this.$el.data('modal').trigger('hide');
  },

  /**
    Incrementally loads information about each story format.
    If there are more remaining to be loaded, then this calls itself
    once the load is complete.

    @method loadNextFormat
  **/

  loadNextFormat: function() {
    if (this.formatsToLoad.length > 0) {
      var format = this.formatsToLoad.at(0);

      format.load(function(e) {
        if (e === undefined) {
          // Calculate containing directory for the format
          // so that image URLs, for example, are correct

          var path = format.get('url').replace(/\/[^\/]*?$/, '');
          var fullContent = _.extend(format.properties, {
            path: path,
            userAdded: format.get('userAdded'),
          });
          var content = $(
            Marionette.Renderer.render(this.itemTemplate, fullContent)
          );

          if (fullContent.proofing) {
            this.$('.proofingFormatList').append(content);
          } else {
            this.$('.storyFormatList').append(content);
          }
        } else {
          // L10n: %1$s is the name of the story format;
          // %2$s is the error message.
          notify(
            locale.say(
              'The story format &ldquo;%1$s&rdquo; could not be loaded (%2$s).',
              format.get('name'),
              e.message),
            'danger'
          );
        }

        this.formatsToLoad.remove(format);
        this.loadNextFormat();
      }.bind(this));
    } else {
      this.syncButtons();
      this.$('.loading').hide();
    }
  },

  /**
    Tries to add a story format and update the list in the modal. If this
    succeeds, the tab where the format now belongs to is shown and the format
    description is animated in. If this fails, an error message is shown to the
    user. This call is asynchronous.

    @method addFormat
    @param {String} url URL of the new story format
  **/

  addFormat: function(url) {
    // Create a temporary model and try loading it

    var test = new StoryFormat({ url: url });
    this.$('.loading').fadeIn();

    test.load(function(err) {
      if (!err) {
        // Save it for real

        data.storyFormats.create({ name: test.properties.name, url: url });

        // Add it to the appropriate list

        var path = url.replace(/\/[^\/]*?$/, '');
        var fullContent = _.extend(test.properties, {
          path: path,
          userAdded: true,
        });
        var content = $(
          Marionette.Renderer.render(this.itemTemplate, fullContent)
        );

        if (fullContent.proofing) {
          this.$('.proofingFormatList').append(content);
          this.$('.showProofingFormats').tab();
          content.hide().slideDown();
        } else {
          this.$('.storyFormatList').append(content);
          this.$('.showStoryFormats').tab();
          content.hide().slideDown();
        }

        // Clear the URL input

        this.$('.addFormat input[type="text"]').val('');
        this.$('.error').hide();
      } else {
        this.$('.error').fadeIn().html(
          locale.say(
            'The story format at %1$s could not be added (%2$s).',
            url,
            err.message
          )
        );
      }

      this.$('.loading').hide();
    }.bind(this));
  },

  /**
    Removes a story format.

    @method removeFormat
    @param {String} name the name of the story format
  **/

  removeFormat: function(name) {
    data.storyFormat(name).destroy();
  },

  /**
    Sets the default story format.

    @method setDefaultFormat
    @param {String} name the name of the story format
  **/

  setDefaultFormat: function(name) {
    data.pref('defaultFormat').save({ value: name });
  },

  /**
    Sets the default proofing format.

    @method setProofingFormat
    @param {String} name the name of the story format
  **/

  setProofingFormat: function(name) {
    data.pref('proofingFormat').save({ value: name });
  },

  /**
    Syncs the active state of setDefault buttons with user preferences.

    @method syncButtons
  **/

  syncButtons: function() {
    var defaultFormat = data.pref('defaultFormat').get('value');
    var proofingFormat = data.pref('proofingFormat').get('value');

    this.$('.storyFormatList .format').each(function() {
      var $t = $(this);

      if ($t.data('format') == defaultFormat) {
        $t.find('.setDefault').addClass('active');
      } else {
        $t.find('.setDefault').removeClass('active');
      }
    });

    this.$('.proofingFormatList .format').each(function() {
      var $t = $(this);

      if ($t.data('format') == proofingFormat) {
        $t.find('.setDefault').addClass('active');
      } else {
        $t.find('.setDefault').removeClass('active');
      }
    });
  },

  events: {
    'click .showRemoveConfirm': function(e) {
      var container = $(e.target).closest('.buttons');
      container.find('.normalButtons').hide();
      container.find('.removeConfirm').fadeIn();
    },

    'click .hideRemoveConfirm': function(e) {
      var container = $(e.target).closest('.buttons');
      container.find('.normalButtons').fadeIn();
      container.find('.removeConfirm').hide();
    },

    'click .remove': function(e) {
      var container = $(e.target).closest('.format');
      this.removeFormat(container.data('format'));
      container.slideUp();
    },

    'click .setDefault': function(e) {
      var container = $(e.target).closest('.format');
      var format = container.data('format');

      if (container.closest('.storyFormatList').length > 0) {
        this.setDefaultFormat(format);
      } else if (container.closest('.proofingFormatList').length > 0) {
        this.setProofingFormat(format);
      } else {
        // L10n: An internal error related to story formats.
        throw new Error(
          locale.say('Don\'t know what kind of format to set as default')
        );
      }

      this.syncButtons();
    },

    'submit .addFormat': function(e) {
      this.addFormat(this.$('.addFormat input[type="text"]').val());
      e.preventDefault();
    },
  },
});

'use strict';
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var data = require('../../../data');
var locale = require('../../../locale');
var modal = require('../../../ui/modal');
var notify = require('../../../ui/notify');
var tab = require('../../../ui/tab');
var StoryFormat = require('../../../data/story-format');
var itemTemplate = require('./item.ejs');
var modalTemplate = require('./modal.ejs');

module.exports = Backbone.View.extend({
  /**
  	 Opens a modal dialog for editing default formats.

  	 @method open
  	**/

  open: function()  {
    this.setElement(modal.open({
      content: Marionette.Renderer.render(modalTemplate),
    }));

    tab.attach(this.$el);

    // Begin loading formats immediately.

    this.formatsToLoad = data.storyFormats.clone();
    this.loadNextFormat();
  },

  /**
  	 Incrementally loads information about each story format.
   	 If there are more remaining to be loaded, then this calls itself
  	 once the load is complete.

  	 @method loadNextFormat
  	**/

  loadNextFormat: function()  {
    if (this.formatsToLoad.length > 0)    {
      var format = this.formatsToLoad.at(0);

      format.load(function(e)      {
        if (e === undefined) {
          this.addLoadedFormat(format);
        } else {
          notify(
            locale.say(
              // L10n: %1$s is the name of the story format;
              // %2$s is the error message.
              'The story format &ldquo;%1$s&rdquo; could not be loaded (%2$s).',
              format.get('name'),
              e.message
            ),
            'danger'
          );
        }

        this.formatsToLoad.remove(format);
        this.loadNextFormat();
      }.bind(this));
    }    else {
      this.syncDefaults();
      this.$('.loading').hide();
    }
  },

  addLoadedFormat: function(format)  {
    // Calculate containing directory for the format
    // so that image URLs, for example, are correct

    var path = format.get('url').replace(/\/[^\/]*?$/, '');
    var fullContent = _.extend(format.properties,
    { path: path, userAdded: format.get('userAdded') });
    var content = $(Marionette.Renderer.render(itemTemplate, fullContent));

    if (fullContent.proofing) {
      this.$('.proofingFormats').append(content);
    } else {
      this.$('.storyFormats').append(content);
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

  addFormat: function(url)  {
    // Create a temporary model and try loading it

    var test = new StoryFormat({ url: url });
    this.$('.loading').fadeIn();

    test.load(function(err)    {
      if (!err)      {
        // Save it for real

        data.storyFormats.create({ name: test.properties.name, url: url });

        this.addLoadedFormat(test);

        // Clear the URL input

        this.$('.addFormat input[type="text"]').val('');
        this.$('.error').addClass('hide');

        notify(locale.say('Story format added.'));
      } else {
        this.$('.error')
          .removeClass('hide')
          .html(
            locale.say(
              'The story format at %1$s could not be added (%2$s).',
              url, err.message
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

  removeFormat: function(name)  {
    data.storyFormat(name).destroy();
  },

  /**
  	 Sets the default story format.

  	 @method setDefaultFormat
  	 @param {String} name the name of the story format
  	**/

  setDefaultFormat: function(name)  {
    data.pref('defaultFormat').save({ value: name });
  },

  /**
  	 Sets the default proofing format.

  	 @method setProofingFormat
  	 @param {String} name the name of the story format
  	**/

  setProofingFormat: function(name)  {
    data.pref('proofingFormat').save({ value: name });
  },

  /**
  	 Syncs the active state of setDefault radio buttons with user preferences.

  	 @method syncDefaults
  	**/

  syncDefaults: function()  {
    var defaultFormat = data.pref('defaultFormat').get('value');
    var proofingFormat = data.pref('proofingFormat').get('value');

    this.$('.storyFormats [data-format]').each(function()    {
      $(this)
        .find('.chooseFormat')
        .attr('checked', $(this).data('format') == defaultFormat);
    });

    this.$('.proofingFormats [data-format]').each(function()    {
      $(this)
        .find('.chooseFormat')
        .attr('checked', $(this).data('format') == proofingFormat);
    });
  },

  events: {
    'click .removeFormat': function(e)  {
      var container = $(e.target).closest('[data-format]');
      this.removeFormat(container.data('format'));
      container.remove();
    },

    'click .chooseFormat': function(e)  {
      var container = $(e.target).closest('[data-format]');
      var format = container.data('format');

      if (container.closest('.storyFormats').length > 0) {
        this.setDefaultFormat(format);
      } else if (container.closest('.proofingFormats').length > 0) {
        this.setProofingFormat(format);
      } else {
        // L10n: An internal error related to story formats.
        throw new Error(
          locale.say('Don\'t know what kind of format to set as default')
        );
      }

      this.syncDefaults();
    },

    'submit .addFormat': function(e)  {
      this.addFormat(this.$('.addFormat input[type="text"]').val());
      e.preventDefault();
    },
  },
});

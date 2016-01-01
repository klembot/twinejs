/**
  Manages the passage editor modal of a StoryEditView.

  @class StoryEditView.PassageEditor.TagsEditor
  @extends Backbone.View
**/

'use strict';

var $ = require('jquery');
var Backbone = require('Backbone');
var tagTemplate = require('./tag.ejs');

module.exports = Backbone.View.extend({
  /**
    Shows the UI for adding a new tag.

    @method showNewTag
  **/

  showNewTag: function() {
    this.$('.showNewTag').addClass('hide');
    this.$('.newTag').removeClass('hide');
    this.$('.newTagName').val('').focus();
  },

  /**
    Hides the UI for adding a new tag.

    @method showNewTag
  **/

  hideNewTag: function()  {
    this.$('.showNewTag').removeClass('hide');
    this.$('.newTag').addClass('hide');
  },

  /**
    Adds a new tag to the list. This does not affect the model
    at all and thus has no validation associated with it.

    @method addTag
    @param {String} name name of the tag to add
   **/

  addTag: function(name)  {
    this.$('.tags').append(tagTemplate({ name: name }));
  },

  onAddTagSubmit: function(event) {
    event.preventDefault();

    var name = this.$('.newTagName').val().trim();
    if (name) {
      this.addTag(name);
    }

    this.hideNewTag();
  },

  getTags: function()  {
    var tags = [];
    this.$('.tag').each(function()    {
      tags.push(this.dataset.name);
    });

    return tags;
  },

  onRemoveTagClick: function(event)  {
    var tagSpan = $(event.target).closest('.tag');
    tagSpan.remove();
  },

  events: {
    'click .showNewTag': 'showNewTag',
    'submit .newTag': 'onAddTagSubmit',
    'reset .newTag': 'hideNewTag',
    'click .tag .remove': 'onRemoveTagClick',
  },
});

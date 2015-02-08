/**
 Manages the passage editor modal of a StoryEditView.

 @class StoryEditView.PassageEditor
 @extends Backbone.View
**/

'use strict';

StoryEditView.PassageEditor = Backbone.View.extend(
{
	tagTemplate:
	'<span class="tag label label-info" data-name="<%- name %>"><%- name %><button class="remove"><i class="fa fa-times"></i></button></span>',

	initialize: function()
	{
		this.tagContainer = this.$('.tags');
		this.tagTemplate = _.template(this.tagTemplate);

		this.$el.on('modalhide', _.bind(this.restoreTitle, this)); 
		this.$el.on('click', '.showNewTag', _.bind(this.showNewTag, this));
		this.$el.on('click', '.hideNewTag', _.bind(this.hideNewTag, this));
		this.$el.on('submit', _.bind(function (e)
		{
			var name = this.$('.newTagName').val().replace(/\s/g, '-');

			// don't add duplicate tags

			if (this.model.get('tags').indexOf(name) == -1)
				this.addTag(name);	

			this.hideNewTag();
			e.preventDefault();
		}, this));

		this.$el.on('click', '.tag .remove', function()
		{
			$(this).closest('.tag').remove();
		});

		this.$el.data('blockModalHide', _.bind(function()
		{
			var worked = this.save();	

			if (worked)
				window.onbeforeunload = null;
			
			return ! worked;
		}, this));
	},

	/**
	 Opens a modal dialog for editing a passage.

	 @method open
	**/

	open: function()
	{
		// remember previous window title

		this.prevTitle = document.title;
		document.title = 'Editing \u201c' + this.model.get('name') + '\u201d';

		this.$('.passageId').val(this.model.id);
		this.$('.passageName').val(this.model.get('name'));
		var text = this.model.get('text');
		this.$('.passageText').val((text == Passage.prototype.defaults.text) ? '' : text);
		
		// sync tags

		this.tagContainer.empty();
		_.each(this.model.get('tags'), this.addTag, this);

		this.$el.data('modal').trigger('show');

		// warn the user about leaving before saving

		window.onbeforeunload = function()
		{
			return 'Any changes to the passage you\'re editing haven\'t been saved yet. (To do so, close the passage editor.)';
		};
	},

	/**
	 Closes the modal dialog for editing.

	 @method close
	**/

	close: function()
	{
		this.$el.data('modal').trigger('hide');
	},

	/**
	 Saves changes made by the user to the model, displaying any validation
	 errors.

	 @method save
	 @param {Event} e Event to stop
	 @return {Boolean} whether the save was successful
	**/

	save: function ()
	{
		// gather current tag names

		var tags = [];

		this.$('.passageTags .tag').each(function()
		{
			tags.push($(this).attr('data-name'));
		});

		// try to save; we might error out if the passage name is a duplicate

		if (this.model.save({
			name: this.$('.passageName').val(),
			text: this.$('.passageText').val(),
			tags: tags
		}))
		{
			// have to manually set the style here because of jQuery .fadeIn()

			this.$('.error').addClass('hide').hide();
			this.$el.removeClass('hasError');
			return true;
		}
		else
		{
			// show the error message

			var message = this.$('.error');
			message.removeClass('hide').text(this.model.validationError).hide().fadeIn();
			this.$el.addClass('hasError');
			this.$('.passageName').focus();
			return false;
		};
	},

	/**
	 Shows the UI for adding a new tag.

	 @method showNewTag
	**/

	showNewTag: function()
	{
		this.$('.showNewTag').hide();
		this.$('.newTag').show();
		this.$('.newTagName').val('').focus();
	},

	/**
	 Hides the UI for adding a new tag.

	 @method showNewTag
	**/

	hideNewTag: function()
	{
		this.$('.showNewTag').show();
		this.$('.newTag').hide();
	},

	/**
	 Adds a new tag to the list. This does not affect the model
	 at all and thus has no validation associated with it.

	 @method addTag
	 @param {String} name name of the tag to add
	**/

	addTag: function (name)
	{
		this.tagContainer.append(this.tagTemplate({ name: name }));
	},

	/**
	 Restores the window title after finishing editing.

	 @method restoreTitle
	**/

	restoreTitle: function()
	{
		document.title = this.prevTitle;
	}
});

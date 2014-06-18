/**
 Manages the passage editor modal of a StoryEditView.

 @class StoryEditView.PassageEditor
 @extends Backbone.View
**/

StoryEditView.PassageEditor = Backbone.View.extend(
{
	tagTemplate:
	'<span class="tag label label-info" data-name="<%- name %>"><%- name %><a href="javascript:void(0)" class="remove danger"><i class="fa fa-times"></i></a></span>',

	initialize: function()
	{
		this.tagContainer = this.$('.tags');
		this.tagTemplate = _.template(this.tagTemplate);

		this.$el.modal({ show: false, backdrop: 'static' });
		this.$el.on('hide.bs.modal', _.bind(this.save, this)); 
		this.$el.on('click', '.showNewTag', _.bind(this.showNewTag, this));
		this.$el.on('blur', '.newTag', _.bind(this.hideNewTag, this));
		this.$el.on('submit', _.bind(function()
		{
			this.addTag(this.$('.newTag').val());	
			this.hideNewTag();
		}, this));
		this.$el.on('click', '.tag .remove', function()
		{
			$(this).closest('.tag').remove();
		});
	},

	/**
	 Opens a modal dialog for editing a passage.

	 @method open
	**/

	open: function()
	{
		this.$('.passageId').val(this.model.id);
		this.$('.passageName').val(this.model.get('name'));
		var text = this.model.get('text');
		this.$('.passageText').val((text == Passage.prototype.defaults.text) ? '' : text);
		
		// sync tags

		this.tagContainer.empty();
		_.each(this.model.get('tags'), this.addTag, this);

		this.$el.modal('show');
	},

	/**
	 Closes the modal dialog for editing.

	 @method close
	**/

	close: function()
	{
		this.$el.modal('hide');
	},

	/**
	 Saves changes made by the user to the model, displaying any validation
	 errors. If this is passed an event and validation fails, this stops the event's
	 propagation.

	 @method close
	 @param {Event} e Event to stop
	**/

	save: function (e)
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
			this.$('.alert').remove();
		else
		{
			// show the error message

			var message = this.$('.alert');
			
			if (message.size() == 0)
				message = $('<p class="alert alert-danger">')
				.text(this.model.validationError);

			this.$('.textareaContainer').before(message);
			message.hide().fadeIn();
			this.$('.passageName').focus();

			// if we are handling an event, stop it

			if (e)
				e.stopImmediatePropagation();
		};
	},

	showNewTag: function()
	{
		this.$('.showNewTag').hide();
		this.$('.newTag').val('').show().focus();
	},

	hideNewTag: function()
	{
		this.$('.showNewTag').show();
		this.$('.newTag').hide();
	},

	addTag: function (name)
	{
		this.tagContainer.append(this.tagTemplate({ name: name }));
	}
});

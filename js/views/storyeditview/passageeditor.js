/**
 Manages the passage editor modal of a StoryEditView.

 @class StoryEditView.PassageEditor
 @extends Backbone.View
**/

StoryEditView.PassageEditor = Backbone.View.extend(
{
	initialize: function()
	{
		this.$el.modal({ show: false, backdrop: 'static' });
		this.$el.on('hide.bs.modal', _.bind(this.save, this)); 
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
		// try to save; we might error out if the passage name is a duplicate

		if (this.model.save({
			name: this.$('.passageName').val(),
			text: this.$('.passageText').val()
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
	}
});

/**
 An individual item in the list managed by StoryListView.
 This offers quick links for editing, playing, and deleting 
 a story; StoryEditView handles more detailed changes.

 @class StoryItemView
 @extends Marionette.ItemView
**/

StoryItemView = Marionette.ItemView.extend(
{
	template: '#templates .storyItemView',

	/**
	 Opens a StoryEditView for this story.

	 @method edit
	**/

	edit: function()
	{
		window.location.hash = '#stories/' + this.model.id;
	},

	/**
	 Plays this story in a new tab.

	 @method play
	**/

	play: function()
	{
		window.open('#stories/' + this.model.id + '/play', 'twinestory_' + this.model.id);
	},

	/**
	 Deletes the model associated with this view.

	 @method delete
	**/

	delete: function()
	{
		this.$('.story').addClass('disappear').one('animationend', _.bind(function()
		{
			this.model.destroy();
		}, this));
	},

	/**
	 Fades in the view, used to highlight views when the parent view is loaded.

	 @method fadeIn
	**/

	fadeIn: function()
	{
		this.$('.story').show().addClass('fadeIn slideDown').one('animationend', function()
		{
			$(this).removeClass('fadeIn slideDown');
		});
	},

	/**
	 Animates the view appearing, as in when it is newly created.

	 @method appear
	**/

	appear: function()
	{
		this.$('.story').addClass('appear');
	},

	events:
	{
		'click .delete': 'delete',
		'click .edit': 'edit',
		'click .play': 'play'
	}
});

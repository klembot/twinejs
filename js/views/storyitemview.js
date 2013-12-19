/**
 An individual item in the list managed by StoryListView.
 This offers quick links for editing, playing, and deleting 
 a story; StoryEditView handles more detailed changes.

 @class StoryItemView
 @extends Marionette.ItemView
**/

StoryItemView = Marionette.ItemView.extend(
{
	tagName: 'tr',
	template: '#templates .storyItemView',

	onRender: function()
	{
		var self = this;

		this.$('a.confirmDelete')
		.popover({
			html: true,
			placement: 'bottom',
			content: function() { return $('#deleteStoryDialog').html() }
		});

		this.$el.on('click', 'button.cancelDelete', function()
		{
			self.$('a.confirmDelete').popover('hide');
		});
	},

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
		this.model.destroy();
	},

	events:
	{
		'click .delete': 'delete',
		'click .edit': 'edit',
		'click .play': 'play'
	}
});

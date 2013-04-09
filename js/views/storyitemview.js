// Shows an individual story list item.

StoryItemView = Marionette.ItemView.extend({
	tagName: 'tr',
	template: '#templates .storyItemView',

	onRender: function()
	{
		this.$('button.deleteStory')
		.popover({
			html: true,
			placement: 'bottom',
			content: function() { return $('#deleteStoryDialog').html() }
		});
	},

	events:
	{
		'click .delete': function()
		{
			this.model.destroy();
		},

		'click .edit': function()
		{
			window.location.hash = '#stories/' + this.model.cid;
		},

		'click .play': function()
		{
			window.open('#stories/' + this.model.cid + '/play', 'twinestory_' + this.model.cid);
		}
	}
});

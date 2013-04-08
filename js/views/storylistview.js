// Shows a list of stories.

StoryListView = Backbone.Marionette.CompositeView.extend({
	itemView: StoryItemView,
	itemViewContainer: 'tbody',
	template: '#templates .storyListView',

	onRender: function()
	{
		this.$('a[title], button[title]').tooltip();

		this.$('.addStory')
		.popover({
			html: true,
			placement: 'right',
			content: function() { return $('#addStoryDialog').html() }
		})
	},

	events:
	{
		'click .add': function()
		{
			this.collection.create({ name: this.$('input.newName').val() });
			this.$('.addStory').popover('hide');
		}
	}
});

// Shows a list of stories.

StoryListView = Backbone.Marionette.CompositeView.extend({
	itemView: StoryItemView,
	itemViewContainer: 'tbody',
	template: '#templates .storyListView',

	onRender: function()
	{
		var self = this;

		this.$('a[title], button[title]').tooltip();

		this.$('button.addStory')
		.popover({
			html: true,
			placement: 'bottom',
			content: function() { return $('#addStoryDialog').html() }
		})
		.click(function()
		{
			$('.popover .newName').focus();
		});

		this.$el.on('click', 'button.cancelAdd', function()
		{
			self.$('.addStory').popover('hide');
		});

		this.$el.on('click', 'button.cancelDelete', function()
		{
			self.$('.deleteStory').popover('hide');
		});
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

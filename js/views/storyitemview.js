// Shows an individual story list item.

define(['marionette', 'bootstrap'],

function (Marionette)
{
	var StoryItemView = Marionette.ItemView.extend(
	{
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
				window.location.hash = '#stories/' + this.model.id;
			},

			'click .play': function()
			{
				window.open('#stories/' + this.model.id + '/play', 'twinestory_' + this.model.id);
			},
			
			'click .publish': function()
			{
				app.publishStory(this.model);
			}
		}
	});

	return StoryItemView;
});

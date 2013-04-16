// Shows a list of stories.

define(['marionette', 'views/storyitemview', 'bootstrap'],

function (Marionette, StoryItemView)
{
	var StoryListView = Backbone.Marionette.CompositeView.extend(
	{
		itemView: StoryItemView,
		itemViewContainer: 'tbody',
		template: '#templates .storyListView',

		updateTable: function()
		{
			if (this.collection.length > 0)
			{
				this.$('table').show();
				this.$('.alert').hide();
			}
			else
			{
				this.$('table').hide();
				this.$('.alert').show();
			}
		},

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

			this.$('button.importStory')
			.popover({
				html: true,
				placement: 'bottom',
				content: function() { return $('#importStoryDialog').html() }
			});

			this.updateTable();
		},

		events:
		{
			'click .add': function()
			{
				this.collection.create({ name: this.$('input.newName').val() });
				this.$('.addStory').popover('hide');
			},

			'click .saveArchive': function()
			{
				app.saveArchive();
			},

			'change .importFile': function (event)
			{
				var reader = new FileReader();
				reader.onload = function (e)
				{
					window.app.importFile(e.target.result);
				};
				reader.readAsText(event.target.files[0], 'UTF-8');
				this.$('.importStory').popover('hide');
			},

			'click .cancelAdd': function()
			{
				this.$('.addStory').popover('hide');
			},

			'click .cancelDelete': function()
			{
				this.$('.deleteStory').popover('hide');
			},

			'click .cancelImport': function()
			{
				this.$('.importStory').popover('hide');
			}
		},

		collectionEvents:
		{
			'add': 'updateTable',
			'remove': 'updateTable'
		}
	});

	return StoryListView;
});

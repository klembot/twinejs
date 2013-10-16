// Shows a list of stories.

StoryListView = Backbone.Marionette.CompositeView.extend(
{
	itemView: StoryItemView,
	itemViewContainer: 'tbody',
	template: '#templates .storyListView',

	updateTable: function()
	{
		if (this.collection.length > 0)
		{
			this.$('table').show();
			this.$('.alert.intro').hide();
		}
		else
		{
			this.$('table').hide();
			this.$('.alert.intro').show();
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
			var self = this;
			var reader = new FileReader();
			reader.onload = function (e)
			{
				var className = '';
				var message = '';

				try
				{
					var count = window.app.importFile(e.target.result);

					if (count > 0)
					{
						className = 'alert-success';

						if (count == 1)
							message = '1 story was imported.';
						else
							message = count + ' stories were imported.';
					}
					else
					{
						className = 'alert-error';
						message = 'Sorry, no stories could be found in this file.';
					}
				}
				catch (e)
				{
					className = 'alert-error';
					message = 'An error occurred while trying to import this file. (' + e.message + ')';
				};

				self.$('#storyListView .navbar').after('<div class="alert ' + className + 
				'"><button class="close" data-dismiss="alert">&times;</button><p>' + message + '</p>');
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

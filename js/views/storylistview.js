/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

StoryListView = Backbone.Marionette.CompositeView.extend(
{
	itemView: StoryItemView,
	itemViewContainer: 'tbody',
	template: '#templates .storyListView',

	onRender: function()
	{
		var self = this;

		this.syncStoryCount();

		// enable tooltips

		this.$('a[title], button[title]').tooltip();

		// enable table sorting

		this.$('table.stories').tablesorter();

		// enable popovers

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

		this.$('button.importStory')
		.popover({
			html: true,
			placement: 'bottom',
			content: function() { return $('#importStoryDialog').html() }
		});

		this.$el.on('click', 'button.cancelImport', function()
		{
			self.$('.importStory').popover('hide');
		});

		// force popover content to hide completely
		// otherwise, inputs would still steal focus --
		// they were set at opacity 0 but display: block still

		this.$el.on('hidden.bs.popover', function (e)
		{
			self.$('.popover').hide();
		});

		// force only one popover visible at a time

		this.$el.on('show.bs.popover', function (e)
		{
			self.$('.pop').not(e.target).popover('hide');	
		});

		// delete popover is set up in StoryItemView
	},

	onAfterItemAdded: function()
	{
		this.syncStoryCount();
	},

	onItemRemoved: function()
	{
		this.syncStoryCount();
	},

	/**
	 Adds a new story with the name entered in the view's input.newName field.
	 TODO: prevent duplicate story names

	 @method addStory
	**/

	addStory: function()
	{
		this.collection.create({ name: this.$('input.newName').val() });
		this.$('.addStory').popover('hide');
	},

	/**
	 Saves an archive of all stories by passing the request onto TwineApp.saveArchive().

	 @method saveArchive
	**/

	saveArchive: function()
	{
		window.app.saveArchive();
	},

	/**
	 Tries to import the file indicated by the view's input.importFile field.
	 The result, either success or failure, is shown above the story table.
	 
	 @method importFile
	**/

	importFile: function (e)
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
					className = 'alert-danger';
					message = 'Sorry, no stories could be found in this file.';
				}
			}
			catch (e)
			{
				className = 'alert-danger';
				message = 'An error occurred while trying to import this file. (' + e.message + ')';
			};

			self.$('.stories').before('<div class="alert ' + className + 
			                          '"><button class="close" data-dismiss="alert">&times;</button><p>' +
									  message + '</p>');
		};

		reader.readAsText(e.target.files[0], 'UTF-8');
		this.$('.importStory').popover('hide');
	},

	/**
	 Syncs onscreen appearance of the story table and our 'there are no stories'
	 message with the collection.

	 @method syncStoryCount
	**/

	syncStoryCount: function ()
	{
		console.log('hi');

		if (this.collection.length > 0)
		{
			this.$('.stories').css('display', 'table');
			this.$('.noStories').css('display', 'none');
		}
		else
		{
			this.$('.stories').css('display', 'none');
			this.$('.noStories').css('display', 'block');
		};
	},

	events:
	{
		'click .add': 'addStory',
		'click .saveArchive': 'saveArchive',
		'change .importFile': 'importFile',
	}
});

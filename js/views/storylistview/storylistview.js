/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';

var StoryListView = Backbone.Marionette.CompositeView.extend(
{
	childView: StoryItemView,
	childViewContainer: '.stories',
	template: '#templates .storyListView',

	/**
	 How long we wait after the user first loads this view
	 to show a message asking for a donation, in milliseconds.

	 @property DONATION_DELAY
	 @final
	**/

	// 14 days
	DONATION_DELAY: 1000 * 60 * 60 * 24 * 14,

	/**
	 How often we check for a new version of Twine, in milliseconds.

	 @property UPDATE_CHECK_DELAY
	 @final
	**/

	// 1 day
	UPDATE_CHECK_DELAY: 1000 * 60 * 60 * 24,

	initialize: function()
	{
		this.sortByDate();
		this.collection.on('sort', this.render);
	},

	onRender: function()
	{
		ui.initEl(this.$el);
		this.syncStoryCount();

		this.storageQuota = new StoryListView.StorageQuota({ parent: this, el: this.$('.quota') });
		this.formatsModal = new StoryListView.FormatsModal({ parent: this, el: this.$('#formatsModal') });

		// set the version number in the HTML

		this.$('.app-version').text(window.app.version);

		// fade in our views in a staggered manner

		this.$('.story').hide();
		var APPEAR_INTERVAL = 100;

		this.children.each(function (view, index)
		{
			_.delay(_.bind(view.fadeIn, view), APPEAR_INTERVAL * index);
		});

		// is it time to ask for a donation?

		var firstRunPref = AppPref.withName('firstRunTime', new Date().getTime());
		var donateShown = AppPref.withName('donateShown', false);

		if (! donateShown.get('value') &&
            new Date().getTime() > firstRunPref.get('value') + this.DONATION_DELAY)
		{
			_.delay(_.bind(function()
			{
				this.$('#donateModal').data('modal').trigger('show');
			}, this), 50);

			donateShown.save({ value: true });
		}
		else
		{
			// is there a new update to Twine?

			var lastUpdateSeenPref = AppPref.withName('lastUpdateSeen', window.app.buildNumber); 
			var lastUpdateCheckPref = AppPref.withName('lastUpdateCheckTime', new Date().getTime());

			if (new Date().getTime() > lastUpdateCheckPref.get('value') + this.UPDATE_CHECK_DELAY)
			{
				window.app.checkForUpdate(lastUpdateSeenPref.get('value'), function (data)
				{
					lastUpdateSeenPref.save({ value: data.buildNumber });
					$('#appUpdateModal .version').text(data.version);
					$('#appUpdateModal a.download').attr('href', data.url);

					_.delay(_.bind(function()
					{
						$('#appUpdateModal').data('modal').trigger('show');
					}, this), 50);
				});
			};
		};
	},

	onAddChild: function ()
	{
		this.syncStoryCount();
	},

	onRemoveChild: function()
	{
		this.syncStoryCount();
	},

	/**
	 Adds a new story with the name entered in the view's input.newName field.
	 TODO: prevent duplicate story names

	 @method addStory
	**/

	addStory: function (e)
	{
		var story = this.collection.create({ name: this.$('input.newName').val() });
		this.children.findByModel(story).edit();
		e.preventDefault();
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
		var reader = new FileReader();
		var bubble = this.$('.importStory').closest('.bubbleContainer');
		bubble.find('.form').addClass('hide');
		bubble.find('.working').removeClass('hide');

		reader.onload = _.bind(function (e)
		{
			var className = '';
			var message = '';

			try
			{
				var count = window.app.importFile(e.target.result);

				if (count > 0)
				{
					if (count == 1)
						message = '1 story was imported.';
					else
						message = count + ' stories were imported.';
				}
				else
				{
					className = 'danger';
					message = 'Sorry, no stories could be found in this file.';
				}
			}
			catch (e)
			{
				className = 'danger';
				message = 'An error occurred while trying to import this file. (' + e.message + ')';
			};

			ui.notify(message, className);
			this.collection.reset(StoryCollection.all().models);
			bubble.find('.form').removeClass('hide');
			bubble.find('.working').addClass('hide');
			this.$('.importStory').bubble('hide');
			ui.initEl(this.$el);
		}, this);

		reader.readAsText(e.target.files[0], 'UTF-8');
	},

	/**
	 Sorts the story list by alphabetical order.

	 @method sortByName
	**/

	sortByName: function()
	{
		this.collection.order = 'name';
		this.collection.reverseOrder = false;
		this.collection.sort();
		this.$('.sortByDate').removeClass('active');
		this.$('.sortByName').addClass('active');
	},

	/**
	 Sorts the story list by last edit date.

	 @method sortByDate
	**/

	sortByDate: function()
	{
		this.collection.order = 'lastUpdate';
		this.collection.reverseOrder = true;
		this.collection.sort();
		this.$('.sortByDate').addClass('active');
		this.$('.sortByName').removeClass('active');
	},

	/**
	 Syncs onscreen appearance of the story table and our 'there are no stories'
	 message with the collection.

	 @method syncStoryCount
	**/

	syncStoryCount: function()
	{
		if (this.collection.length > 0)
		{
			this.$('.stories').css('display', 'block');
			this.$('.noStories').css('display', 'none');
		}
		else
		{
			this.$('.stories').css('display', 'none');
			this.$('.noStories').css('display', 'block');
		};

		document.title = this.collection.length + ' Stor' +
		                 ((this.collection.length == 1) ? 'y' : 'ies');
	},

	events:
	{
		'submit #addStoryForm': 'addStory',
		'click .saveArchive': 'saveArchive',
		'change .importFile': 'importFile',
		'click .sortByDate': 'sortByDate',
		'click .sortByName': 'sortByName',
		'click .showFormats': function()
		{
			this.formatsModal.open();	
		},
	}
});

/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';

var StoryListView = Backbone.Marionette.CompositeView.extend(
{
	itemView: StoryItemView,
	itemViewContainer: '.stories',
	template: '#templates .storyListView',

	/**
	 How long we wait after the user first loads this view
	 to show a message asking for a donation, in milliseconds.

	 @property DONATION_DELAY
	 @final
	**/

	// 14 days
	DONATION_DELAY: 1000 * 60 * 60 * 24 * 14,

	initialize: function()
	{
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

		var firstRunPref = AppPref.withName('firstRunTime');
		var donateShown = AppPref.withName('donateShown');

		if (! firstRunPref)
		{
			console.log('creating firstRun');
			var firstRunPref = new AppPref({ name: 'firstRunTime', value: new Date().getTime() });
			AppPrefCollection.all().add(firstRunPref);
			firstRunPref.save();
		}
		else if ((! donateShown || ! donateShown.get('value')) &&
			     new Date().getTime() > firstRunPref.get('value') + this.DONATION_DELAY)
		{
			_.delay(_.bind(function()
			{
				this.$('#donateModal').data('modal').trigger('show');
			}, this), 50);

			if (! donateShown)
			{
				donateShown = new AppPref({ name: 'donateShown', value: true });
				AppPrefCollection.all().add(donateShown);
				donateShown.save();
			}
			else
				donateShown.save({ value: true });
		};
	},

	onAfterItemAdded: function ()
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

		reader.onload = function (e)
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
		};

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

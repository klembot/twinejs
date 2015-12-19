/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';
var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var archive = require('../data/archive');
var file = require('../file');
var locale = require('../locale');
var notify = require('../ui/notify');
var prompt = require('../ui/modal/prompt');
var upload = require('../ui/modal/upload');
var AboutModal = require('./modals/about');
var FormatsModal = require('./modals/formats');
var Passages = require('../data/passages');
var Pref = require('../data/pref');
var StorageQuota = require('./storage-quota');
var Stories = require('../data/stories');
var StoryItemView = require('./item/view');
var TwineApp = require('../common/app');
var UpdateModal = require('./modals/update');
var importingTemplate = require('./importing.ejs');
var viewTemplate = require('./view.ejs');

module.exports = Marionette.CompositeView.extend(
{
	childView: StoryItemView,
	childViewContainer: '.stories',
	childViewOptions: function (model)
	{
		/**
		 A cached collection of all passages, to speed up rendering of previews.
		 @property previewCache
		**/

		if (! this.previewCache)
			this.previewCache = Passages.all();

		return { parentView: this, passages: this.previewCache.where({ story: model.get('id') }) };
	},

	template: viewTemplate,

	/**
	 If true, then we do not animate the stories appearing, nor
	 do we do a version or donation check.

	 @property appearFast
	 @default false
	**/

	appearFast: false,

	initialize: function()
	{
		this.sortByDate();
		this.collection.on('sort', function()
		{
			this.render();

			// reset SVG previews

			this.children.each(function (view)
			{
				view.preview.passagesRendered = false;
			});

			this.showNextPreview();
		}.bind(this));

		this.collection.on('add', function()
		{
			this.previewCache = null;
		}.bind(this));

		this.collection.on('reset', function()
		{
			this.previewCache = null;
			this.render();
		}.bind(this));
	},

	onShow: function()
	{
		var appVersion = TwineApp.version();

		this.syncStoryCount();

		this.aboutModal = new AboutModal({ parent: this });
		this.formatsModal = new FormatsModal({ parent: this, el: this.$('#formatsModal') });
		this.storageQuota = new StorageQuota({ parent: this, el: this.$('.quota') });

		// set the version number in the HTML

		this.$('.app-version').text(appVersion.version);

		// if we were previously editing a story, show a proxy
		// shrinking back into the appropriate item

		if (this.previouslyEditing)
		{
			var proxy = $('<div id="storyEditProxy" class="fullAppear fast reverse">');
			proxy.one('animationend', function()
			{
				proxy.remove();
			});

			this.children.find(function (c)
			{
				if (c.model.get('id') == this.previouslyEditing)
				{
					var $s = c.$('.story');
					var o = $s.offset();
					o.left += $s.outerHeight() / 2;

					// we don't vertically center because it zooms into empty
					// space on short titles

					proxy.css(
					{
						'-webkit-transform-origin': o.left + 'px ' + o.top + 'px',
						transformOrigin: o.left + 'px ' + o.top + 'px'
					});
					return true;
				};
			}.bind(this));

			this.$el.append(proxy);
		};

		// if we were asked to appear fast, we do nothing else

		if (this.appearFast)
			return;

		// check for new version

		UpdateModal.check();
	},

	onDomRefresh: function()
	{
		// trigger display of previews

		_.defer(this.showNextPreview.bind(this));
	},

	onAddChild: function()
	{
		this.syncStoryCount();
	},

	onRemoveChild: function()
	{
		this.syncStoryCount();
	},

	addStory: function()
	{
		prompt({
			prompt: locale.say("What should your story be named? You can change this later."),
			confirmLabel: '<i class="fa fa-plus"></i> ' + locale.say('Add'),
			confirmClass: 'create',
			callback: function (confirmed, text)
			{
				if (confirmed)
				{
					var story = this.collection.create({ name: text });
					this.children.findByModel(story).edit();
				};
			}.bind(this)
		});
	},

	/**
	 Saves an archive of all stories.

	 @method saveArchive
	**/

	saveArchive: function()
	{
		try
		{
			file.save(archive.create(), archive.name());
		}
		catch (e)
		{
			// FIXME
		};
	},

	/**
	 Prompts the user for a file to upload and attempts to import it.
	 The result, either success or failure, is shown as a notification.
	**/

	importFile: function (e)
	{
		var uploadModal = upload({
			content: locale.say('You may import a Twine 2 archive file or a published Twine 2 stories. Stories created by Twine 1 cannot be imported.'),
			autoclose: false,
			callback: function parseUploadedFile (confirmed, data)
			{
				if (confirmed)
				{
					uploadModal.find('.uploadModal').html(Marionette.Renderer.render(importingTemplate));

					var className = 'success';
					var message = '';

					try
					{
						var count = archive.import(data);

						if (count > 0)
						{
							// L10n: %d is a number of stories.
							message = locale.sayPlural('%d story was imported.',
													   '%d stories were imported.', count);
						}
						else
						{
							className = 'danger';
							message = locale.say('Sorry, no stories could be found in this file.');
						}
					}
					catch (err)
					{
						className = 'danger';
						message = locale.say('An error occurred while trying to import this file. (' + err.message + ')');
					};

					notify(message, className);
					this.collection.reset(Stories.all().models);
				};
				
				upload.close();
			}.bind(this),
		});
	},

	showNextPreview: function()
	{
		var unrendered = this.children.find(function (view)
		{
			return ! view.preview.passagesRendered;
		});
		
		if (unrendered !== undefined)
		{
			unrendered.preview.renderPassages(this.showNextPreview.bind(this));
		};
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
			this.$('.stories').css('display', 'flex');
			this.$('.noStories').css('display', 'none');
		}
		else
		{
			this.$('.stories').css('display', 'none');
			this.$('.noStories').css('display', 'block');
		};

		// L10n: %d is a number of stories
		document.title = locale.sayPlural('%d Story', '%d Stories', this.collection.length);
	},

	events:
	{
		'click .addStory': 'addStory',
		'click .saveArchive': 'saveArchive',
		'click .importFile': 'importFile',
		'click .sortByDate': 'sortByDate',
		'click .sortByName': 'sortByName',

		'click .showAbout': function()
		{
			this.aboutModal.open();
		},

		'click .showFormats': function()
		{
			this.formatsModal.open();
		},

		'click .showLocale': function()
		{
			window.location.hash = 'locale';
		},

		'click .showHelp': function()
		{
			window.open('http://twinery.org/2guide');
		}
	}
});

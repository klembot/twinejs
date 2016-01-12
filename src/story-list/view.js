/*
#story-list/view

Exports a view which manages a list of stories.
*/

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
var StorageQuota = require('./storage-quota');
var StoryItemView = require('./item/view');
var TwineApp = require('../common/app');
var UpdateModal = require('./modals/update');
var importingTemplate = require('./importing.ejs');
var viewTemplate = require('./view.ejs');

var StoryListView = Marionette.CompositeView.extend({
	childView: StoryItemView,
	childViewContainer: '.stories',
	childViewOptions: function() {
		return { parent: this };
	},

	template: viewTemplate,
	templateHelpers: {
		appVersion: TwineApp.version().version
	},

	/*
	If true, then we do not animate the stories appearing, nor
	do we do a version or donation check.

	@property appearFast
	@default false
	*/
	appearFast: false,

	onShow: function() {
		this.sortByDate();

		// Set up our subcomponents.

		this.aboutModal = new AboutModal({ parent: this });
		this.formatsModal = new FormatsModal({ parent: this });
		this.storageQuota = new StorageQuota({
			parent: this,
			el: this.$('.quota')
		});

		/*
		If we were previously editing a story, show a proxy shrinking back into
		the appropriate item.
		*/

		if (this.previouslyEditing) {
			var proxy =
				$('<div id="storyEditProxy" class="fullAppear fast reverse">');

			proxy.one('animationend', function() {
				proxy.remove();
			});

			this.children.find(function(c) {
				if (c.model.get('id') == this.previouslyEditing) {
					var $s = c.$('.story');
					var o = $s.offset();

					o.left += $s.outerHeight() / 2;

					/*
					We don't vertically center because it zooms into empty
					space on short titles. The vendor prefix is annoying, but I
					don't see a way to use a better polyfill.
					*/

					proxy.css({
						'-webkit-transform-origin': o.left + 'px ' + o.top + 'px',
						transformOrigin: o.left + 'px ' + o.top + 'px'
					});
					return true;
				}
			}.bind(this));

			this.$el.append(proxy);
		}

		// If we were asked to appear fast, we do nothing else.

		if (this.appearFast) { return; }

		// Let the updater check for new version.

		UpdateModal.check();

		// TODO: donation check
	},

	onDomRefresh: function() {
		this.syncStoryCount();

		/*
		Kick off the story preview rendering process. This must be deferred so
		all initialization on child views has time to take place.
		*/

		_.defer(function() {
			this.children.each(function(view) {
				view.preview.rendered = false;
			});

			this.showNextPreview();
		}.bind(this));
	},

	/*
	Ask the user what to name a new story, then create it.

	@method addStory
	*/
	addStory: function() {
		prompt({
			prompt: locale.say(
				'What should your story be named? You can change this later.'
			),
			confirmLabel: '<i class="fa fa-plus"></i> ' + locale.say('Add'),
			confirmClass: 'create',
			callback: function(confirmed, text) {
				if (confirmed) {
					var story = this.collection.create({ name: text });

					this.children.findByModel(story).edit();
				}
			}.bind(this)
		});
	},

	/*
	Saves an archive of all stories.

	@method saveArchive
	*/
	saveArchive: function() {
		try {
			file.save(archive.create(), archive.name());
		}
		catch (e) {
			// FIXME
		}
	},

	/*
	Prompts the user for a file to upload and attempts to import it.
	The result, either success or failure, is shown as a UI notification.

	@method importFile
	*/
	importFile: function() {
		var uploadModal = upload({
			content: locale.say(
				'You may import a Twine 2 archive file or a published ' +
				'Twine 2 stories. Stories created by Twine 1 cannot be ' +
				'imported.'
			),
			autoclose: false,
			callback: function parseUploadedFile(confirmed, data) {
				if (confirmed) {
					uploadModal.find('.uploadModal').html(
						Marionette.Renderer.render(importingTemplate)
					);

					var className = 'success';
					var message = '';

					try {
						var count = archive.import(data);

						if (count > 0) {
							// L10n: %d is a number of stories.
							message = locale.sayPlural(
								'%d story was imported.',
								'%d stories were imported.',
								count
							);
						}
						else {
							className = 'danger';
							message = locale.say(
								'Sorry, no stories could be found in this file.'
							);
						}
					}
					catch (err) {
						className = 'danger';
						message = locale.say(
							'An error occurred while trying to import this ' +
							'file. (%s) ',
							err.message
						);
					}

					notify(message, className);
				}

				upload.close();
			}.bind(this)
		});
	},

	/*
	Asks the next child view to render its preview. We do this asynchronously
	to avoid locking up the browser.

	@method showNextPreview
	*/

	showNextPreview: function() {
		var unrenderedIndex;

		var unrendered = this.children.find(function findUnrendered(view, index) {
			if (!view.preview.rendered) {
				unrenderedIndex = index;
				return true;
			}
		});

		/*
		If there is in fact a view that needs rendering, ask to do so, and once
		it's done so, make another call to this method so we keep the process
		moving.
		*/

		if (unrendered !== undefined) {
			unrendered.preview.render(function() {
				if (this.appearFast) {
					unrendered.display();
				}
				else {
					_.delay(
						unrendered.fadeIn.bind(unrendered),
						unrenderedIndex * StoryListView.APPEAR_DELAY
					);
				}

				this.showNextPreview();
			}.bind(this));
		}
		else {
			this.appearFast = false;
		}
	},

	/**
	    Sorts the story list by alphabetical order.

	    @method sortByName
	  **/

	sortByName: function() {
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

	sortByDate: function() {
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

	syncStoryCount: function() {
		if (this.collection.length > 0) {
			this.$('.stories').css('display', 'flex');
			this.$('.noStories').css('display', 'none');
		}
		else {
			this.$('.stories').css('display', 'none');
			this.$('.noStories').css('display', 'block');
		}

		// L10n: %d is a number of stories
		document.title = locale.sayPlural(
		'%d Story', '%d Stories',
		this.collection.length
		);
	},

	collectionEvents: {
		'update reset sort': function() {
			this.render();
		}
	},

	events: {
		'click .addStory': 'addStory',
		'click .saveArchive': 'saveArchive',
		'click .importFile': 'importFile',
		'click .sortByDate': 'sortByDate',
		'click .sortByName': 'sortByName',

		'click .showAbout': function() {
			this.aboutModal.open();
		},

		'click .showFormats': function() {
			this.formatsModal.open();
		},

		'click .showLocale': function() {
			window.location.hash = 'locale';
		},

		'click .showHelp': function() {
			window.open('http://twinery.org/2guide');
		}
	}
},
{
	APPEAR_DELAY: 75
});

module.exports = StoryListView;

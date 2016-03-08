/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';
const $ = require('jquery');
const _ = require('underscore');
const Marionette = require('backbone.marionette');
const importer = require('../file/importer');
const locale = require('../locale');
const notify = require('../ui/notify');
const publish = require('../story-publish');
const AppPref = require('../data/models/app-pref');
const FormatsModal = require('./modals/formats-modal');
const PassageCollection = require('../data/collections/passage');
const StorageQuota = require('./storage-quota');
const StoryCollection = require('../data/collections/story');
const StoryItemView = require('./story-item-view');
const storyListTemplate = require('./ejs/story-list-view.ejs');

require('../ui/bubble');
require('../ui/modal');
require('../ui/tooltip');

module.exports = Marionette.CompositeView.extend({
	childView: StoryItemView,
	childViewContainer: '.stories',
	childViewOptions(model) {
		/**
		 A cached collection of all passages, to speed up rendering of
		 previews.
		 @property previewCache
		**/

		if (!this.previewCache) {
			this.previewCache = PassageCollection.all();
		}

		return {
			parentView: this,
			passages: this.previewCache.where({ story: model.get('id') })
		};
	},

	template: storyListTemplate,

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

	/**
	 If true, then we do not animate the stories appearing, nor
	 do we do a version or donation check.

	 @property appearFast
	 @default false
	**/

	appearFast: false,

	initialize() {
		this.sortByDate();
		this.collection.on('sort', function() {
			this.render();

			// reset SVG previews

			this.children.each(view => {
				view.preview.passagesRendered = false;
			});

			this.showNextPreview();
		}.bind(this));

		this.collection.on('add', function() {
			this.previewCache = null;
		}.bind(this));

		this.collection.on('reset', function() {
			this.previewCache = null;
			this.render();
		}.bind(this));
	},

	onShow() {
		this.syncStoryCount();

		this.storageQuota = new StorageQuota({
			parent: this,
			el: this.$('.quota')
		});
		this.formatsModal = new FormatsModal({
			parent: this,
			el: this.$('#formatsModal')
		});

		// set the version number in the HTML

		this.$('.app-version').text(window.app.version);

		// if we were previously editing a story, show a proxy
		// shrinking back into the appropriate item

		if (this.previouslyEditing) {
			const proxy =
				$('<div id="storyEditProxy" class="fullAppear fast reverse">');

			proxy.one('animationend', () => {
				proxy.remove();
			});

			this.children.find(function(c) {
				if (c.model.get('id') == this.previouslyEditing) {
					const $s = c.$('.story');
					const o = $s.offset();

					o.left += $s.outerHeight() / 2;

					// we don't vertically center because it zooms into empty
					// space on short titles

					proxy.css({
						'-webkit-transform-origin': o.left + 'px ' +
							o.top + 'px',
						transformOrigin: o.left + 'px ' + o.top + 'px'
					});

					return true;
				};
			}.bind(this));

			this.$el.append(proxy);
		};

		// if we were asked to appear fast, we do nothing else

		if (this.appearFast) {
			return;
		}

		// is it time to ask for a donation?

		const firstRunPref = AppPref.withName(
			'firstRunTime', new Date().getTime()
		);
		const donateShown = AppPref.withName('donateShown', false);

		if (!donateShown.get('value') && new Date().getTime() >
				firstRunPref.get('value') + this.DONATION_DELAY) {
			_.delay(function() {
				this.$('#donateModal').data('modal').trigger('show');
			}.bind(this), 50);

			donateShown.save({ value: true });
		}
		else {
			// is there a new update to Twine?

			const lastUpdateSeenPref = AppPref.withName(
				'lastUpdateSeen',
				window.app.buildNumber
			);

			// force last update to be at least the current app version

			if (lastUpdateSeenPref.get('value') < window.app.buildNumber) {
				lastUpdateSeenPref.save({ value: window.app.buildNumber });
			}

			const lastUpdateCheckPref = AppPref.withName(
				'lastUpdateCheckTime',
				new Date().getTime()
			);

			if (new Date().getTime() > lastUpdateCheckPref.get('value') +
				this.UPDATE_CHECK_DELAY) {
				window.app.checkForUpdate(
					lastUpdateSeenPref.get('value'),
					function(data) {
						lastUpdateSeenPref.save({ value: data.buildNumber });
						$('#appUpdateModal .version').text(data.version);
						$('#appUpdateModal a.download').attr('href', data.url);

						_.delay(() => {
							$('#appUpdateModal').data('modal').trigger('show');
						}, 50);
					}
				);
			}
		}
	},

	onDomRefresh() {
		// trigger display of previews

		_.defer(this.showNextPreview.bind(this));
	},

	onAddChild() {
		this.syncStoryCount();
	},

	onRemoveChild() {
		this.syncStoryCount();
	},

	/**
	 Adds a new story with the name entered in the view's input.newName field.
	 TODO: prevent duplicate story names

	 @method addStory
	**/

	addStory(e) {
		const story = this.collection.create({
			name: this.$('input.newName').val()
		});

		this.children.findByModel(story).edit();
		e.preventDefault();
	},

	/**
	 Saves an archive of all stories by passing the request onto
	 TwineApp.saveArchive().

	 @method saveArchive
	**/

	saveArchive() {
		publish.saveArchive();
	},

	/**
	 Tries to import the file indicated by the view's input.importFile field.
	 The result, either success or failure, is shown above the story table.
	 
	 @method importFile
	**/

	importFile(e) {
		const reader = new FileReader();
		const bubble = this.$('.importStory').closest('.bubbleContainer');

		bubble.find('.form').addClass('hide');
		bubble.find('.working').removeClass('hide');

		reader.addEventListener('load', (e) => {

			importer.import(e.target.result, { confirmReplace: true }).then(
				({count, added}) => {
					let className = '';
					let message = '';

					if (added > 0) {
						// L10n: %d is a number of stories.
						message = locale.sayPlural(
							'%d story was imported.',
							'%d stories were imported.',
							added
						);
					}
					else if (count === 0) {
						className = 'danger';
						message = 'Sorry, no stories could be found in this file.';
					}
					notify(message, className);
					this.collection.reset(StoryCollection.all().models);
					bubble.find('.form').removeClass('hide');
					bubble.find('.working').addClass('hide');
					this.$('.importStory').bubble('hide');
				},
				err => {
					notify(
						'An error occurred while trying to import this file. (' +
							err.message + ')',
						'danger'
					);
				});
		});

		reader.readAsText(e.target.files[0], 'UTF-8');
		return reader;
	},

	showNextPreview() {
		const unrendered = this.children.find(view => !view.preview.passagesRendered);
		
		if (unrendered !== undefined) {
			unrendered.preview.renderPassages(this.showNextPreview.bind(this));
		}
	},

	/**
	 Sorts the story list by alphabetical order.

	 @method sortByName
	**/

	sortByName() {
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

	sortByDate() {
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

	syncStoryCount() {
		if (this.collection.length > 0) {
			this.$('.stories').css('display', 'block');
			this.$('.noStories').css('display', 'none');
		}
		else {
			this.$('.stories').css('display', 'none');
			this.$('.noStories').css('display', 'block');
		}

		// L10n: %d is a number of stories
		document.title = locale.sayPlural(
			'%d Story',
			'%d Stories',
			this.collection.length
		);
	},

	events: {
		'submit #addStoryForm': 'addStory',
		'click .saveArchive': 'saveArchive',
		'change .importFile': 'importFile',
		'click .sortByDate': 'sortByDate',
		'click .sortByName': 'sortByName',

		'click .showFormats'() {
			this.formatsModal.open();
		},

		'click .showLocale'() {
			window.location.hash = 'locale';
		},

		'click .showHelp'() {
			window.open('http://twinery.org/2guide');
		}
	}
});

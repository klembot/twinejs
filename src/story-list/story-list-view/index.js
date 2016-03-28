/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';
const $ = require('jquery');
const Vue = require('vue');
const importer = require('../../file/importer');
const locale = require('../../locale');
const confirm = require('../../ui/confirm');
const notify = require('../../ui/notify');
const publish = require('../../story-publish');
const AppPref = require('../../data/models/app-pref');
const StoryCollection = require('../../data/collections/story');
const FormatsModal = require('../formats-modal');
const AboutModal = require('../about-modal');

require('../../ui/bubble');
require('../../ui/modal');
require('../../ui/tooltip');

//How long we wait after the user first loads this view
//to show a message asking for a donation, in milliseconds.

// 14 days
const DONATION_DELAY = 1000 * 60 * 60 * 24 * 14;

//How often we check for a new version of Twine, in milliseconds.

// 1 day
const UPDATE_CHECK_DELAY = 1000 * 60 * 60 * 24;

module.exports = Vue.extend({

	data: () => ({
		// Currently a Backbone collection. Its models attribute is iterated over with v-for.
		collection: [],

		// If true, then we do not animate the stories appearing, nor
		// do we do a version or donation check.
		appearFast: false,

		// The ID of the story that was being edited.
		// Assume that if this is null, the app was just launched.
		previouslyEditing: null,

		// What to order the <story-item-view>s by ('name'. 'lastUpdate').
		order: 'name',
	}),

	computed: {
		version() { return window.app.version; }
	},

	components: {
		'story-item-view': require('../story-item-view'),
		'quota-gauge': require('../../quota-gauge'),
	},

	template: require('./index.html'),

	compiled() {
		this.syncStoryCount();

		// if we were previously editing a story, show a proxy
		// shrinking back into the appropriate item

		if (this.previouslyEditing) {
			const proxy =
				$('<div id="storyEditProxy" class="fullAppear fast reverse">');

			proxy.one('animationend', () => {
				proxy.remove();
			});

			this.collection.forEach((c) => {
				if (c.get('id') == this.previouslyEditing) {
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
			});

			$(this.$el).append(proxy);
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
				firstRunPref.get('value') + DONATION_DELAY) {

				confirm({
					message:
						locale.say(
							'If you love Twine as much as I do, please consider helping it grow with'+
							' a donation. Twine is as an open source project that will always be free'+
							' to use &mdash; and with your help, Twine will continue to thrive.'
						) +
						'<p class="signature" style="float:left; font-size:80%">' +
						'<img src="./img/klimas.png" style="display:block">' +
						locale.say('Chris Klimas, Twine creator') + '</p>',
					buttonLabel:
						'<i class="fa fa-heart-o"></i> ' + locale.say('Donate'),
					cancelLabel:
						locale.say('No Thanks'),
					coda:
						locale.say('This message will only be shown to you once.<br>' +
							"If you'd like to donate to Twine development in the future, " +
							'you can do so at <a href="http:\/\/twinery.org/donate" target="_blank">http://twinery.org/donate</a>.'
						),
					modalClass:
						'no-icon',
					buttonClass:
						'download',
				}).then(() => {
					window.open('http://twinery.org/donate');
				});
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
				UPDATE_CHECK_DELAY) {
				window.app.checkForUpdate(
					lastUpdateSeenPref.get('value'),
					({buildNumber, version, url}) => {
						lastUpdateSeenPref.save({ value: buildNumber });

						confirm({
							message:
								// L10n: The <span> will have a version number, i.e.
								// 2.0.6, interpolated into it.
								locale.say(
									'A new version of Twine, <span class="version"></span>, has been released.'
								).replace("><", ">" + version + "<"),
							buttonLabel:
								'<i class="fa fa-download"></i>' + locale.say('Download'),
							cancelLabel:
								// L10n: A polite rejection of a request, in the sense that the answer
								// may change in the future.
								locale.say('Not Right Now'),
							buttonClass:
								'download',
							modalClass:
								'info',
						})
						.then(() => { window.open(url); });
					}
				);
			}
		}
	},

	events: {
		/*
			This event is only dispatched by child <story-item-view> elements.
		*/
		add(model) {
			this.collection.add(model);
		},
	},

	methods: {

		/**
		 Adds a new story with the name entered in the view's input.newName field.
		 TODO: prevent duplicate story names

		 @method createStory
		**/

		createStory(e) {
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
			const bubble = $(this.$el).find('.importStory').closest('.bubbleContainer');

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
						$(this.$el).find('.importStory').bubble('hide');
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

		showAbout() {
			new AboutModal().$mountTo(document.body);
		},

		showFormats() {
			new FormatsModal().$mountTo(document.body);
		},

		/**
		 Sorts the story list by alphabetical order.

		 @method sortByName
		**/

		sortByName() {
			this.collection.order = 'name';
			this.collection.reverseOrder = false;
			this.collection.sort();
			this.order = 'name';
		},

		/**
		 Sorts the story list by last edit date.

		 @method sortByDate
		**/

		sortByDate() {
			this.collection.order = 'lastUpdate';
			this.collection.reverseOrder = true;
			this.collection.sort();
			this.order = 'lastUpdate';
		},

		/**
		 Syncs onscreen appearance of the story table and our 'there are no stories'
		 message with the collection.

		 @method syncStoryCount
		**/

		syncStoryCount() {

			// L10n: %d is a number of stories
			document.title = locale.sayPlural(
				'%d Story',
				'%d Stories',
				this.collection.length
			);
		},

		showLocale() {
			window.location.hash = 'locale';
		},

		showHelp() {
			window.open('http://twinery.org/2guide');
		},
	},
});

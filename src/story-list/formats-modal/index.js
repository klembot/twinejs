'use strict';
const $ = require('jquery');
const _ = require('underscore');
const Vue = require('vue');
const locale = require('../../locale');
const notify = require('../../ui/notify');
const confirm = require('../../ui/confirm');
const StoryFormat = require('../../data/models/story-format');
const StoryFormatCollection = require('../../data/collections/story-format');
const AppPref = require('../../data/models/app-pref');

module.exports = Vue.extend({

	data: () => ({
		// Used to create the <format-item>s using v-for.
		storyFormats:[],
		proofingFormats:[],
		// Determines whether to show the error <span>, and with what text.
		error: '',
		// Determines whether to show the loading spinner.
		loading: false,
		// Bound to the text in the "new format" input.
		newFormatUrl: "",
		// Passed to child items; see below.
		defaultFormatPref: null,
		proofingFormatPref: null,
	}),

	template: require('./index.html'),

	components: {
		'format-item': require('../format-item'),
		'tab-item': require('../../ui/tab-item'),
		'tabs-panel': require('../../ui/tabs-panel'),
		'modal-dialog': require('../../ui/modal-dialog'),
	},

	// The AppPref model which is passed to the <format-item>s. (to manage the state of the 'make default' button)
	// must be referentially identical across all <format-item>s, so the parent <formats-modal> retrieves it
	// via withName() and passes it to its children.
	// It also must be reactive, so it needs to be implicitly converted to a reactive object via this attachment here
	// (as opposed to being a computed property).
	created() {
		this.defaultFormatPref = AppPref.withName('defaultFormat');
		this.proofingFormatPref =  AppPref.withName('proofingFormat');
	},

	methods: {
		/**
		 Tries to add a story format and update the list in the modal. If this
		 succeeds, the tab where the format now belongs to is shown and the format
		 description is animated in. If this fails, an error message is shown to
		 the user. This call is asynchronous.

		 @method addFormat
		 @param {String} url URL of the new story format
		**/

		addFormat() {
			const url = this.newFormatUrl;

			// create a temporary model and try loading it

			const test = new StoryFormat({ url });

			this.loading = true;

			test.load((err) => {
				if (!err) {
					// save it for real

					new StoryFormatCollection().create({
						name: test.properties.name,
						url
					});
					
					// add it to the appropriate list

					const path = url.replace(/\/[^\/]*?$/, '');
					const fullContent = _.extend(
						test.properties,
						{ path, userAdded: true }
					);

					this[fullContent.proofing ? 'proofingFormats' : 'storyFormats']
						.push(fullContent);

					// Clear the URL input
					this.newFormatUrl = '';
					this.error = '';
				}
				else {
					this.error = locale.say(
						'The story format at %1$s could not be added (%2$s).',
						url,
						err.message
					);
				}

				this.loading = false;
			});
		},
	},

	ready() {
		const formatsToLoad = StoryFormatCollection.all();

		const loadNextFormat = () => {
			if (formatsToLoad.length > 0) {
				const format = formatsToLoad.at(0);

				format.load((e) => {
					if (e === undefined) {
						// calculate containing directory for the format
						// so that image URLs, for example, are correct

						const path = format.get('url').replace(/\/[^\/]*?$/, '');
						const fullContent = _.extend(
							format.properties,
							{ path, userAdded: format.get('userAdded') }
						);

						this[fullContent.proofing ? 'proofingFormats' : 'storyFormats']
							.push(fullContent);
					}
					else {
						notify(
							// L10n: %1$s is the name of the story format; %2$s is
							// the error message.
							locale.say(
								'The story format &ldquo;%1$s&rdquo; could not ' +
								'be loaded (%2$s).',
								format.get('name'),
								e.message
							),
							'danger'
						);
					}
					formatsToLoad.remove(format);
					loadNextFormat();
				});
			}
		};
		loadNextFormat();
	},
});

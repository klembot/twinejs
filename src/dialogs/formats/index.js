const Vue = require('vue');
const { createFormatFromUrl, loadFormat } = require('../../data/actions');
const locale = require('../../locale');
const notify = require('../../ui/notify');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		/* Detail about each format. */
		loadedFormats: [],

		/* Determines whether to show the error <span>, and with what text. */
		error: '',

		/* Determines whether to show the loading spinner. */
		working: true,

		/* The index number of the next format to load. */
		loadIndex: 0,

		/* Bound to the text in the "new format" input. */
		newFormatUrl: '',

		/* The origin element to show the dialog coming from. */
		origin: null
	}),

	/*
	These are linked to the Vuex formatNames, so that when a format is deleted
	it will disappear from these properties.
	*/

	computed: {
		proofingFormats() {
			let result = [];

			this.formatNames.forEach(name => {
				const format = this.loadedFormats.find(
					format => format.name === name
				);

				if (format && format.properties.proofing) {
					result.push(format);
				}
			});

			return result;
		},

		storyFormats() {
			let result = [];

			this.formatNames.forEach(name => {
				const format = this.loadedFormats.find(
					format => format.name === name
				);

				if (format && !format.properties.proofing) {
					result.push(format);
				}
			});

			return result;
		}
	},

	methods: {
		// Loads the next pending format.

		loadNext() {
			if (this.loadIndex < this.formatNames.length) {
				this.loadFormat(this.formatNames[this.loadIndex])
				.then(format => {
					this.loadedFormats.push(format);
					this.loadIndex++;
					this.loadNext();
				})
				.catch(e => {
					notify(
						// L10n: %1$s is the name of the story format; %2$s is
						// the error message.
						locale.say(
							'The story format &ldquo;%1$s&rdquo; could not ' +
							'be loaded (%2$s).',
							this.formatNames[this.loadIndex],
							e.message
						),
						'danger'
					);
				});
			}
			else {
				this.working = false;
			}
		},

		/**
		 Tries to add a story format and update the list in the modal. If this
		 succeeds, the tab where the format now belongs to is shown and the format
		 description is animated in. If this fails, an error message is shown to
		 the user. This call is asynchronous.

		 @method addFormat
		 @param {String} url URL of the new story format
		**/

		addFormat() {
			this.working = true;

			this.createFormatFromUrl(this.newFormatUrl)
			.then(format => {
				this.error = '';
				this.working = false;
				this.loadNext();

				// Show the tab the format will be loaded into.

				if (format.proofing) {
					this.$refs.tabs.active = 1;
				}
				else {
					this.$refs.tabs.active = 0;
				}
			})
			.catch(e => {
				this.error = locale.say(
					'The story format at %1$s could not be added (%2$s).',
					this.newFormatUrl,
					e.message
				);
				this.working = false;
			});
		}
	},

	ready() {
		// Move tabs into the dialog header.

		const dialogTitle = this.$el.parentNode.querySelector(
			'.modal-dialog > header .title'
		);
		const tabs = this.$el.parentNode.querySelectorAll(
			'p.tabs-panel button'
		);

		for (let i = 0; i < tabs.length; i++) {
			dialogTitle.appendChild(tabs[i]);
		}

		this.loadNext();
	},

	vuex: {
		actions: {
			createFormatFromUrl,
			loadFormat
		},

		getters: {
			formatNames: state => state.storyFormat.formats.map(
				format => format.name
			),
			defaultFormatPref: state => state.pref.defaultFormat,
			proofingFormatPref: state => state.pref.proofingFormat
		}
	},

	components: {
		'format-item': require('./item'),
		'tab-item': require('../../ui/tab-panel/item'),
		'tabs-panel': require('../../ui/tab-panel'),
		'modal-dialog': require('../../ui/modal-dialog')
	}
});

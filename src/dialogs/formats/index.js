const Vue = require('vue');
const semverUtils = require('semver-utils');
const { createFormatFromUrl, loadFormat, repairFormats } = require('../../data/actions/story-format');
const locale = require('../../locale');

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
			return this.loadedFormats.filter(
				format => format.properties.proofing
			);
		},

		storyFormats() {
			return this.loadedFormats.filter(
				format => !format.properties.proofing
			);
		}
	},

	methods: {
		// Loads the next pending format.

		loadNext() {
			if (this.loadIndex < this.allFormats.length) {
				this.loadFormat(
					this.allFormats[this.loadIndex].name,
					this.allFormats[this.loadIndex].version
				).then(format => {
					this.loadedFormats.push(format);
					this.loadIndex++;
					this.loadNext();
				}).catch(e => {
					const brokenFormat = this.allFormats[this.loadIndex];

					this.loadedFormats.push(Object.assign(
						{},
						brokenFormat,
						{
							broken: true,
							/* Force allow the format to be deleted. */
							userAdded: true,
							properties: {
								version: brokenFormat.version,
								description:
									locale.say(
										'This story format could not be loaded (%1$s).',
										e.message
									)
							}
						}
					));

					this.loadIndex++;
					this.loadNext();
				});
			}
			else {
				this.working = false;
			}
		},

		/**
		 Tries to add a story format and update the list in the modal. If this
		 succeeds, the tab where the format now belongs to is shown and the
		 format description is animated in. If this fails, an error message is
		 shown to the user. This call is asynchronous.

		 @method addFormat
		 @param {String} url URL of the new story format
		**/

		addFormat() {
			this.working = true;

			this.createFormatFromUrl(this.newFormatUrl)
				.then(format => {
					this.repairFormats();
					this.error = '';
					this.working = false;
					this.loadedFormats.push(format);

					if (format.properties.proofing) {
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
			loadFormat,
			repairFormats
		},

		getters: {
			allFormats: state => {
				let result = state.storyFormat.formats.map(
					format => ({ name: format.name, version: format.version })
				);
				
				result.sort((a, b) => {
					if (a.name < b.name) {
						return -1;
					}
					
					if (a.name > b.name) {
						return 1;
					}

					const aVersion = semverUtils.parse(a.version);
					const bVersion = semverUtils.parse(b.version);

					if (aVersion.major > bVersion.major) {
						return -1;
					}
					else if (aVersion.major < bVersion.major) {
						return 1;
					}
					else {
						if (aVersion.minor > bVersion.minor) {
							return -1;
						}
						else if (aVersion.minor < bVersion.minor) {
							return 1;
						}
						else {
							if (aVersion.patch > bVersion.patch) {
								return -1;
							}
							else if (aVersion.patch < bVersion.patch) {
								return 1;
							}
							else {
								return 0;
							}
						}
					}
				});

				return result;
			},

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

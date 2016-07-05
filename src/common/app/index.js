// The main app running the show.

'use strict';
const $ = require('jquery');
const Vue = require('vue');
const { addFormat, setPref, updateFormat } = require('../../data/actions');
const { allFormats, formatNamed, prefNamed } = require('../../data/getters');
const ui = require('../../ui');
const store = require('../../data/store');

module.exports = Vue.extend({
	template: '<div><router-view></router-view></div>',

	data: () => ({
		name: '',
		version: '',
		buildNumber: ''
	}),

	ready() {
		this.name = $('html').data('app-name');
		this.version = $('html').data('version');
		this.buildNumber = parseInt($('html').data('build-number'));

		ui.init();

		// Compatibility with the update check dialog.

		window.app = this;

		// Create built-in story formats if they don't already exist.

		if (!formatNamed(this.$store.state, 'Harlowe')) {
			addFormat(
				this.$store,
				{ 
					name: 'Harlowe',
					url: 'story-formats/Harlowe/format.js',
					userAdded: false
				}
			);
		}

		if (!formatNamed(this.$store.state, 'Snowman')) {
			addFormat(
				this.$store,
				{ 
					name: 'Harlowe',
					url: 'story-formats/Snowman/format.js',
					userAdded: false
				}
			);
		}

		if (!formatNamed(this.$store.state, 'SugarCube')) {
			addFormat(
				this.$store,
				{ 
					name: 'Harlowe',
					url: 'story-formats/SugarCube/format.js',
					userAdded: false
				}
			);
		}

		if (!formatNamed(this.$store.state, 'Paperthin')) {
			addFormat(
				this.$store,
				{ 
					name: 'Paperthin',
					url: 'story-formats/Paperthin/format.js',
					userAdded: false
				}
			);
		}

		// Repair paths to use kebab case, as in previous versions we used
		// camel case.

		allFormats(this.$store.state).forEach(format => {
			if (/^storyFormats\//i.test(format.url)) {
				updateFormat(
					this.$store,
					format.id,
					{
						url: format.url.replace(
							/^storyFormats\//i, 'story-formats/'
						)
					}
				);
			}
		});

		// Set default formats if not already set.

		if (!prefNamed(this.$store.state, 'defaultFormat')) {
			setPref(this.$store, 'defaultFormat', 'Harlowe');
		}

		if (!prefNamed(this.$store.state, 'proofingFormat')) {
			setPref(this.$store, 'proofingFormat', 'Paperthin');
		}
	},

	store
});

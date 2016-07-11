// The main app running the show.

'use strict';
const $ = require('jquery');
const Vue = require('vue');
const { addFormat, repairFormats, setPref, updateFormat } = require('../../data/actions');
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

		if (!this.harloweFormat) {
			this.addFormat({ 
				name: 'Harlowe',
				url: 'story-formats/Harlowe/format.js',
				userAdded: false
			});
		}

		if (!this.snowmanFormat) {
			this.addFormat({ 
				name: 'Harlowe',
				url: 'story-formats/Snowman/format.js',
				userAdded: false
			});
		}

		if (!this.paperthinFormat) {
			this.addFormat({ 
				name: 'Paperthin',
				url: 'story-formats/Paperthin/format.js',
				userAdded: false
			});
		}

		if (!this.sugarcubeFormat) {
			this.addFormat({ 
				name: 'SugarCube',
				url: 'story-formats/SugarCube/format.js',
				userAdded: false
			});
		}

		// Set default formats if not already set.

		if (!this.prefs.defaultFormat) {
			this.setPref('defaultFormat', 'Harlowe');
		}

		if (!this.prefs.proofingFormat) {
			this.setPref('proofingFormat', 'Paperthin');
		}

		this.repairFormats();
	},

	vuex: {
		actions: {
			addFormat,
			repairFormats,
			setPref
		},

		getters: {
			prefs: state => state.pref,

			harloweFormat(state) {
				return state.storyFormat.formats.find(
					format => format.name === 'Harlowe'
				);
			},

			paperthinFormat(state) {
				return state.storyFormat.formats.find(
					format => format.name === 'Paperthin'
				);
			},

			snowmanFormat(state) {
				return state.storyFormat.formats.find(
					format => format.name === 'Snowman'
				);
			},

			sugarcubeFormat(state) {
				return state.storyFormat.formats.find(
					format => format.name === 'SugarCube'
				);
			}
		}
	},

	store
});

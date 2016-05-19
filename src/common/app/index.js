// The main app running the show.

'use strict';
const $ = require('jquery');
const Vue = require('vue');
const nwui = require('../../nwui');
const ui = require('../../ui');
const AppPref = require('../../data/models/app-pref');
const StoryFormatCollection = require('../../data/collections/story-format');

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

		if (nwui.active) {
			nwui.init();
		}

		ui.init();

		// Compatibility with the update check dialog.

		window.app = this;

		// create built-in story formats if they don't already exist

		const formats = StoryFormatCollection.all();

		if (!formats.findWhere({ name: 'Harlowe' })) {
			formats.create({
				name: 'Harlowe',
				url: 'story-formats/Harlowe/format.js',
				userAdded: false
			});
		}

		if (!formats.findWhere({ name: 'Snowman' })) {
			formats.create({
				name: 'Snowman',
				url: 'story-formats/Snowman/format.js',
				userAdded: false
			});
		}

		if (!formats.findWhere({ name: 'Paperthin' })) {
			formats.create({
				name: 'Paperthin',
				url: 'story-formats/Paperthin/format.js',
				userAdded: false
			});
		}

		if (!formats.findWhere({ name: 'SugarCube' })) {
			formats.create({
				name: 'SugarCube',
				url: 'story-formats/SugarCube/format.js',
				userAdded: false
			});
		}

		// repair paths to use kebab case

		formats.forEach(format => {
			if (/^storyFormats\//i.test(format.get('url'))) {
				format.save(
					'url',
					format.get('url').replace(/^storyFormats\//i, 'story-formats/')
				);
			}
		});

		// set default formats if not already set
		// (second param is a default)

		AppPref.withName('defaultFormat', 'Harlowe');
		AppPref.withName('proofingFormat', 'Paperthin');
	}
});

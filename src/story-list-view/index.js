/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';
const Vue = require('vue');
const backboneCollection = require('../vue/mixins/backbone-collection');
const fileImport = require('../file/import');
const locale = require('../locale');
const { check: checkForAppUpdate } = require('../dialogs/app-update');
const { check: checkForDonation } = require('../dialogs/app-donation');

module.exports = Vue.extend({
	template: require('./index.html'),
	
	props: ['collection', 'appearFast', 'previouslyEditing'],

	computed: {
		storyCountDesc() {
			return locale.sayPlural(
				'%d Story',
				'%d Stories',
				this.collection.length
			);
		}
	},

	watch: {
		storyCountDesc: {
			handler(value) {
				document.title = value;
			},

			immediate: true
		}
	},

	ready() {
		// if we were asked to appear fast, we do nothing.
		
		if (this.appearFast) {
			return;
		}
		
		// Otherwise, we check to see if we should ask for a donation, and
		// then an app update...

		if (!this.appearFast && !checkForDonation()) {
			checkForAppUpdate();
		}

		// And if the user had been previously editing a story (as the router
		// will tell us), we broadcast an event so that an appropriate child
		// component can set up a zoom transition back into itself.

		if (this.previouslyEditing) {
			this.$broadcast('previously-editing', this.previouslyEditing);
		}
	},

	components: {
		'story-item': require('./story-item'),
		'list-toolbar': require('./list-toolbar'),
		'file-drag-n-drop': require('../ui/file-drag-n-drop'),
	},

	events: {
		// We reflect back `story-edit` events onto children, so that the appropriate
		// StoryItem can edit itself, e.g. animate into editing.

		'story-edit'(model) {
			this.$broadcast('story-edit', model);
		},

		// For now, we only support importing a single file at a time.

		'file-drag-n-drop'(files) {
			fileImport.importFile(files[0]);
		}
	},

	methods: {
		/**
		 Sorts the story list by alphabetical order.

		 @method sortByName
		**/

		sortByName() {
			this.$collection.order = 'name';
			this.$collection.reverseOrder = false;
			this.$collection.sort();
		},

		/**
		 Sorts the story list by last edit date.

		 @method sortByDate
		**/

		sortByDate() {
			this.$collection.order = 'lastUpdate';
			this.$collection.reverseOrder = true;
			this.$collection.sort();
		}
	},

	mixins: [backboneCollection]
});

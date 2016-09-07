/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';
const Vue = require('vue');
const locale = require('../locale');
const { check: checkForAppUpdate } = require('../dialogs/app-update');
const { check: checkForDonation } = require('../dialogs/app-donation');
const ImportDialog = require('../dialogs/story-import');

module.exports = Vue.extend({
	template: require('./index.html'),
	
	props: {
		appearFast: {
			type: Boolean,
			default: false
		},

		previouslyEditing: {
			type: String,
			default: null
		}
	},

	data: () => ({
		storyOrder: 'name'
	}),

	computed: {
		sortedStories() {
			// If we have no stories to sort, don't worry about it.

			if (this.stories.length === 0) {
				return this.stories;
			}

			switch (this.storyOrder) {
				case 'name':
					return this.stories.sort((a, b) => {
						if (a.name > b.name) {
							return 1;
						}

						if (a.name < b.name) {
							return -1;
						}

						return 0;
					});

				case 'lastUpdate':
					return this.stories.sort((a, b) => {
						const aTime = a.lastUpdate.getTime();
						const bTime = b.lastUpdate.getTime();

						if (aTime > bTime) {
							return 1;
						}

						if (aTime < bTime) {
							return -1;
						}

						return 0;
					});

				default:
					throw new Error(`Don't know how to sort by ${this.storyOrder}`);
			}
		},

		storyCountDesc() {
			return locale.sayPlural(
				'%d Story',
				'%d Stories',
				this.stories.length
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

		if (!this.appearFast && !checkForDonation(this.$store)) {
			checkForAppUpdate(this.$store);
		}

		// And if the user had been previously editing a story (as the router
		// will tell us), we broadcast an event so that an appropriate child
		// component can set up a zoom transition back into itself.

		if (this.previouslyEditing) {
			this.$broadcast('previously-editing', this.previouslyEditing);
		}
	},

	methods: {
		sortByDate() {
			this.storyOrder = 'lastUpdate';
		},

		sortByName() {
			this.storyOrder = 'name';
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

		'story-edit'(id) {
			this.$broadcast('story-edit', id);
		},

		// For now, we only support importing a single file at a time.

		'file-drag-n-drop'(files) {
			new ImportDialog({
				store: this.$store,
				data: {
					immediateImport: files[0]
				}
			}).$mountTo(document.body);
		}
	},

	vuex: {
		getters: {
			stories: state => state.story.stories
		}
	}
});

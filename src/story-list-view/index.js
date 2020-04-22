/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';
const Vue = require('vue');
const locale = require('../locale');
const {check: checkForAppUpdate} = require('../dialogs/app-update');
const {check: checkForDonation} = require('../dialogs/app-donation');
const isElectron = require('../electron/is-electron');
const ImportDialog = require('../dialogs/story-import');

require('./index.less');

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
		/*
		Set the default story list sorting to 'name', 'asc' (i.e. A → Z).
		*/

		storyOrder: 'name',
		storyOrderDir: 'asc'
	}),

	computed: {
		showBrowserWarning() {
			if (!/Safari\//.test(navigator.userAgent)) {
				return false;
			}

			if (navigator.standalone) {
				// We are in iOS "standalone" or full-screen mode. This is supposed to have its own localStorage which is not subject to the seven-day limit.
				// https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
				return false;
			}

			// Safari 13.0 is OK, but anything after that isn't.

			const version = /Version\/13\.(\d)/.exec(navigator.userAgent);

			if (!version || !version[1] || version[1] === '0') {
				return false;
			}

			return true;
		},

		showiOSWarning() {
			// This returns true on iOS (whether in standalone mode or not). It returns false on MacOS.
			return (navigator.standalone !== undefined);
		},

		sortedStories() {
			/*
			If we have no stories to sort, don't worry about it.
			*/

			if (this.stories.length === 0) {
				return this.stories;
			}

			switch (this.storyOrder) {
				case 'name':
					return this.stories.sort((a, b) => {
						if (a.name > b.name) {
							return this.storyOrderDir === 'asc' ? 1 : -1;
						}

						if (a.name < b.name) {
							return this.storyOrderDir === 'asc' ? -1 : 1;
						}

						return 0;
					});

				case 'lastUpdate':
					return this.stories.sort((a, b) => {
						const aTime = a.lastUpdate.getTime();
						const bTime = b.lastUpdate.getTime();

						if (aTime > bTime) {
							return this.storyOrderDir === 'asc' ? 1 : -1;
						}

						if (aTime < bTime) {
							return this.storyOrderDir === 'asc' ? -1 : 1;
						}

						return 0;
					});

				default:
					throw new Error(
						`Don't know how to sort by "${this.storyOrder}"`
					);
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
		/* If we were asked to appear fast, we do nothing. */

		if (this.appearFast) {
			return;
		}

		/*
		Otherwise, we check to see if we should ask for a donation, and then an
		app update...
		*/

		if (
			!this.appearFast &&
			!checkForDonation(this.$store) &&
			isElectron()
		) {
			checkForAppUpdate(this.$store);
		}

		/*
		And if the user had been previously editing a story (as the router will
		tell us), we broadcast an event so that an appropriate child component
		can set up a zoom transition back into itself.
		*/

		if (this.previouslyEditing) {
			this.$broadcast('previously-editing', this.previouslyEditing);
		}
	},

	methods: {
		sortByDate() {
			/*
			If the last story order was 'lastUpdate', toggle the story order
			direction.  Elsewise, default to 'desc' (i.e. newest -> oldest).
			*/

			if (this.storyOrder === 'lastUpdate') {
				this.storyOrderDir =
					this.storyOrderDir === 'asc' ? 'desc' : 'asc';
			} else {
				this.storyOrderDir = 'desc';
			}

			this.storyOrder = 'lastUpdate';
		},

		sortByName() {
			/*
			If the last story order was 'name', toggle the story order
			direction. Elsewise, default to 'asc' (i.e. A -> Z).
			*/

			if (this.storyOrder === 'name') {
				this.storyOrderDir =
					this.storyOrderDir === 'asc' ? 'desc' : 'asc';
			} else {
				this.storyOrderDir = 'asc';
			}

			this.storyOrder = 'name';
		}
	},

	components: {
		'story-item': require('./story-item'),
		'list-toolbar': require('./list-toolbar'),
		'file-drag-n-drop': require('../ui/file-drag-n-drop')
	},

	events: {
		/*
		We reflect back `story-edit` events onto children, so that the
		appropriate StoryItem can edit itself, e.g. animate into editing.
		*/

		'story-edit'(id) {
			this.$broadcast('story-edit', id);
		},

		/* For now, we only support importing a single file at a time. */

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

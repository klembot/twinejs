/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';
const $ = require('jquery');
const Vue = require('vue');
const backboneCollection = require('../vue/mixins/backbone-collection');
const locale = require('../locale');
const { check: checkForAppUpdate } = require('../dialogs/app-update');
const { check: checkForDonation } = require('../dialogs/app-donation');
const ZoomTransition = require('./zoom-transition');

module.exports = Vue.extend({
	template: require('./index.html'),

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

		// What to name a new story.
		newStoryName: '',
	}),

	computed: {
		order() {
			return this.collection.order;
		},

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

	compiled() {
		// if we were asked to appear fast, we do nothing. Otherwise, 
		// we check to see if we should ask for a donation, and then an app
		// update.

		if (!this.appearFast && !checkForDonation()) {
			checkForAppUpdate();
		}
	},

	components: {
		'story-item': require('./story-item'),
		'list-toolbar': require('./list-toolbar')
	},

	events: {
		// We reflect back `edit` events onto children, so that the appropriate
		// StoryItem can edit itself, e.g. animate into editing.

		edit(model) {
			this.broadcast('edit', model);
		}
	},

	methods: {
		// if we were previously editing a story, show a zoom
		// shrinking back into the appropriate item

		zoomFromStory(id) {
			const zoom = new ZoomTransition();
			zoom.reverse = true;

			this.$children.forEach(({model, $el}) => {
				if (model && model.get('id') === id) {
					const {left, top} = $($el).offset();
					zoom.x = left + $($el).outerWidth() / 2;
					zoom.y = top;
					return true;
				};
			});
			zoom.$mountTo(this.$el);
		},

		/**
		 Sorts the story list by alphabetical order.

		 @method sortByName
		**/

		sortByName() {
			this.collection.order = 'name';
			this.collection.reverseOrder = false;
			this.collection.sort();
		},

		/**
		 Sorts the story list by last edit date.

		 @method sortByDate
		**/

		sortByDate() {
			this.collection.order = 'lastUpdate';
			this.collection.reverseOrder = true;
			this.collection.sort();
		}
	},

	mixins: [backboneCollection]
});

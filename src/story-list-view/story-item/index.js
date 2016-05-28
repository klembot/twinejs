// An individual item in the list managed by StoryListView.  This offers quick
// links for editing, playing, and deleting a story; StoryEditView handles more
// detailed changes.

'use strict';
const $ = require('jquery');
const moment = require('moment');
const Vue = require('vue');
const backboneModel = require('../../vue/mixins/backbone-model');
const PassageCollection = require('../../data/collections/passage');
const ZoomTransition = require('../zoom-transition');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		name: '',
		lastUpdate: new Date(),
	}),

	props: {
		model: Object
	},

	components: {
		'item-preview': require('./item-preview'),
		'item-menu': require('./item-menu')
	},

	computed: {
		lastUpdateFormatted() {
			return moment(this.lastUpdate).format('lll');
		},

		hue() {
			// A hue based on the story's name.

			return [...this.model.get('name')].reduce(
				(hue, char) => hue + char.charCodeAt(), 0
			) % 360;
		},

		passages() {
			return PassageCollection.all().where({ story: this.model.get('id') });
		}
	},

	events: {
		// If our parent wants to edit our own model, then we do so. This is
		// done this level so that we animate the transition correctly.

		edit(model) {
			if (this.model === model) {
				this.edit();
			}
		},

		// if we were previously editing a story, show a zoom shrinking back
		// into us. The signature is a little bit different to save time; we
		// know the ID of the story from the route, but don't have an object.

		'previously-editing'(id) {
			if (id === this.model.id) {
				// The method for grabbing the page position of our element is
				// cribbed from http://youmightnotneedjquery.com/.

				let rect = this.$el.getBoundingClientRect();

				new ZoomTransition({
					data: {
						reverse: true,
						x: rect.left + (rect.right - rect.left) / 2,
						y: rect.top + (rect.bottom - rect.top) / 2
					}
				}).$mountTo(document.body);
			}
		}
	},

	methods: {
		/**
		 Opens a StoryEditView for this story.

		 @method edit
		**/

		edit() {
			const $el = $(this.$el);

			new ZoomTransition({ data: {
				x: $el.offset().left + $el.outerWidth() / 2,
				y: $el.offset().top,
			}}).$mountTo(this.$el).then(
				() => window.location.hash = '#stories/' + this.model.id
			);
		},
	},

	mixins: [backboneModel]
});

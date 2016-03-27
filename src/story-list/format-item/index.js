'use strict';
const Vue = require('vue');
const _ = require('underscore');
const locale = require('../../locale');
const confirm = require('../../ui/confirm');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		format: Object,
		// The appPref passed in manages the state of the 'make default' button.
		appPref: Object,
	},

	computed:
		_.extend({
			default() {
				return this.appPref.get('value') === this.format.name;
			},
			license() {
				return this.format.license ? locale.say(
					/* L10n: %s is the name of a software license. */
					'License: %s', this.format.license
				) : '';
			},
			author() {
				return this.format.author ? locale.say(
					/* L10n: %s is the name of an author. */
					'by %s', this.format.author
				) : '';
			},
		},
		// Allow these properties to be accessed without being prefaced with "format."
		['userAdded', 'name', 'path', 'version', 'description', 'image'].reduce((a,e) => {
			a[e] = function() { return this.format[e]; };
			return a;
		}, {})),

	methods: {

		removeFormat() {
			confirm({
				message:
					locale.say('Are you sure?'),
				buttonLabel:
					'<i class="fa fa-lg fa-trash-o"></i> ' + locale.say('Remove'),
				buttonClass:
					'danger',
			}).then(() => {
				StoryFormat.withName(this.format.name).destroy();
				this.$destroy(true);
			});
		},

		setDefaultFormat() {
			this.appPref.save({ value: this.format.name });
		},
	},
});

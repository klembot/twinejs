'use strict';
const Vue = require('vue');
const locale = require('../../locale');
const { confirm } = require('../confirm');
const { deleteFormat, setPref } = require('../../data/actions');

module.exports = Vue.extend({
	template: require('./item.html'),

	props: {
		// A format that this component represents.
		format: Object
	},

	computed: {
		isDefault() {
			if (this.format.properties.proofing) {
				return this.proofingFormatPref === this.format.name;
			}

			return this.defaultFormatPref === this.format.name;
		},

		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');

			return path + '/' + this.format.properties.image;
		},

		license() {
			return this.format.properties.license ? locale.say(
				/* L10n: %s is the name of a software license. */
				'License: %s', this.format.properties.license
			) : '';
		},

		author() {
			return this.format.properties.author ? locale.say(
				/* L10n: %s is the name of an author. */
				'by %s', this.format.properties.author
			) : '';
		}
	},

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
				this.deleteFormat(this.format.id);
			});
		},

		setDefaultFormat() {
			if (this.format.properties.proofing) {
				this.setPref('proofingFormat', this.format.name);
			}
			else {
				this.setPref('defaultFormat', this.format.name);
			}
		},
	},

	vuex: {
		actions: {
			deleteFormat,
			setPref
		},

		getters: {
			defaultFormatPref: state => state.pref.defaultFormat,
			proofingFormatPref: state => state.pref.proofingFormat
		}
	}
});

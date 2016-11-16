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
				return this.proofingFormatPref.name === this.format.name &&
					this.proofingFormatPref.version === this.format.version;
			}

			return this.defaultFormatPref.name === this.format.name &&
				this.defaultFormatPref.version === this.format.version;
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
				this.setPref(
					'proofingFormat',
					{ name: this.format.name, version: this.format.version }
				);
			}
			else {
				this.setPref(
					'defaultFormat', 
					{ name: this.format.name, version: this.format.version }
				);
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

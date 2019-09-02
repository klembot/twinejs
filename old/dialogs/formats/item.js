import Vue from 'vue';
import {deleteFormat} from '../../data/actions/story-format';
import eventHub from '../../common/eventHub';
import {say} from '../../locale';
import {setPref} from '../../data/actions/pref';
import template from './item.html';
import './item.less';

export default Vue.extend({
	template,
	props: {
		/* A format that this component represents. */
		format: Object
	},
	computed: {
		isDefault() {
			if (this.format.properties.proofing) {
				return (
					this.proofingFormatPref.name === this.format.name &&
					this.proofingFormatPref.version === this.format.version
				);
			}

			return (
				this.defaultFormatPref.name === this.format.name &&
				this.defaultFormatPref.version === this.format.version
			);
		},

		selectorInputTitle() {
			return say('Set this format as default for stories');
		},

		removeButtonTitle() {
			return say('Remove this format');
		},

		nameVersion() {
			return this.format.name + '-' + this.format.properties.version;
		},

		author() {
			if (this.format.properties.author) {
				/* L10n: %s is the name of an author. */
				return say('by %s', this.format.properties.author);
			}

			return '';
		},

		/*
		Calculates the image source relative to the format's path.
		*/

		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');

			return path + '/' + this.format.properties.image;
		}
	},
	methods: {
		removeFormat() {
			if (this.isDefault) {
				eventHub.$emit('modalConfirm', {
					buttonLabel: '<i class="fa fa-lg fa-check"></i> ' + say('OK'),
					message: say(
						'You may not remove the default story format. Please choose another one first.'
					)
				});
				return;
			}

			eventHub.$once('close', confirmed => {
				if (confirmed) {
					this.deleteFormat(this.format.id);
				}
			});
			eventHub.$emit('modalConfirm', {
				buttonLabel: '<i class="fa fa-lg fa-trash-o"></i> ' + say('Remove'),
				message: say('Are you sure?'),
				buttonClass: 'danger'
			});
		},

		setDefaultFormat() {
			if (this.format.properties.proofing) {
				this.setPref('proofingFormat', {
					name: this.format.name,
					version: this.format.version
				});
			} else {
				this.setPref('defaultFormat', {
					name: this.format.name,
					version: this.format.version
				});
			}
		}
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

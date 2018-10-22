/**
 Manages modals with a single text input, a la window.prompt.

 @module ui/confirm
**/

'use strict';
const locale = require('../../locale');
const eventHub = require('../../common/eventHub');
const Vue = require('vue');
const { thenable } = require('../../vue/mixins/thenable');

require('./index.less');

/**
 Shows a modal confirmation dialog, with one button (to continue the action)
 and a Cancel button.

 @param {Object} options Object with optional parameters:
						 message (HTML source of the message)
						 [modalClass] (CSS class to apply to the modal),
						 [buttonClass] (CSS class to apply to the action button)
						 buttonLabel (HTML label for the button)
**/

const confirmation = Vue.component('confirm', {
	template: require('./index.html'),

	props: ['confirmButtonLabel', 'confirmModalClass', 'confirmButtonClass', 'confirmCoda', 'confirmMessage'],

	data: () => ({
		message: '',
		coda: '',
		cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say('Cancel')),
		buttonLabel: '',
		modalClass: '',
		buttonClass: 'primary'
	}),

	methods: {
		accept() {
			eventHub.$emit('close', true);
			this.$emit('close', true);
		},

		cancel() {
			eventHub.$emit('close', false);
			this.$emit('close', true);
		},
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
	},

	mixins: [thenable]
});

module.exports = {
	component: confirmation
};

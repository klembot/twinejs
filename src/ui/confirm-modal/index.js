/**
 Manages modals with a single text input, a la window.prompt.

 @module ui/confirm
**/

'use strict';
const locale = require('../../locale');
const Vue = require('vue');
const {thenable} = require('../../vue/mixins.js');

/**
 Shows a modal confirmation dialog, with one button (to continue the action)
 and a Cancel button.

 @param {Object} options Object with optional parameters:
						 message (HTML source of the message)
						 [modalClass] (CSS class to apply to the modal),
						 [buttonClass] (CSS class to apply to the action button)
						 buttonLabel (HTML label for the button)
**/

module.exports = Vue.extend({
	data: () => ({
		message: '',
		coda: '',
		cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say("Cancel")),
		buttonLabel: '',
		modalClass: '',
		buttonClass: '',
	}),
	components: {
		'modal-dialog': require('../modal-dialog'),
	},
	methods: {
		accept() {
			this.$broadcast('close', true);
		},
		cancel() {
			this.$broadcast('close', false);
		},
	},
	template: require('./index.html'),
	mixins: [thenable],
});

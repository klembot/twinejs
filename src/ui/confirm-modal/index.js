/**
 Manages modals with a single text input, a la window.prompt.

 @module ui/confirm
**/

'use strict';
const locale = require('../../locale');
const Vue = require('vue');
const {thenable} = require('../../common/vue-mixins.js');

/**
 Shows a modal confirmation dialog, with one button (to continue the action)
 and a Cancel button.

 @param {Object} options Object with optional parameters:
						 message (HTML source of the message)
						 [modalClass] (CSS class to apply to the modal),
						 [buttonClass] (CSS class to apply to the action button)
						 buttonLabel (HTML label for the button)
**/

const ConfirmModal = Vue.extend({
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
			this.$broadcast('close-dialog', true);
		},
		cancel() {
			this.$broadcast('close-dialog', false);
		},
	},
	template: require('./index.html'),
	mixins: [thenable],
});

module.exports = (data) =>
	new ConfirmModal({data}).$mountTo(document.body).then(result => {
		// False results are produced by the close button and the cancel
		// button. If the result is false, convert it into a rejection.

		// Note: this may change in the future, as using rejections for negative
		// results is somewhat unidiomatic.
		if (!result) {
			throw result;
		}
		return result;
	});

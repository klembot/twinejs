/**
 Manages modals with a single text input, a la window.prompt.

 @module ui/confirm
**/

"use strict";
const locale = require('../../locale');
const eventHub = require("../../common/eventHub");
const Vue = require('vue');

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

const confirmation = Vue.component("confirm", {
	template: require('./index.html'),

	props: {
		buttonLabel: { type: String, default: "" },
		modalClass: { type: String, default: "" },
		buttonClass: { type: String, default: 'primary' },
		coda: { type: String, default: "" },
		message: { type: String, default: "" }
	},

	data: () => ({
		cancelLabel: '<i class="fa fa-times"></i> ' + locale.say("Cancel")
	}),

	methods: {
		accept() {
			eventHub.$emit("close", true);
			this.$emit("close", true);
		},

		cancel() {
			eventHub.$emit("close", false);
			this.$emit("close", true);
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	}
});

module.exports = {
	component: confirmation
};
